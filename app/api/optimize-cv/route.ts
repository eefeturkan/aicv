import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// Create Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { jobMatchAnalysisId } = await req.json();

    // 1. Validation
    if (!jobMatchAnalysisId) {
      return NextResponse.json(
        { error: "Missing job match analysis ID" },
        { status: 400 }
      );
    }

    // 2. Get job match analysis
    const { data: jobMatch, error: jobMatchError } = await supabaseAdmin
      .from("job_match_analyses")
      .select(`
        *,
        cv_analyses (
          id,
          user_id,
          file_url,
          file_name
        )
      `)
      .eq("id", jobMatchAnalysisId)
      .single();

    if (jobMatchError || !jobMatch) {
      return NextResponse.json(
        { error: "Job match analysis not found" },
        { status: 404 }
      );
    }

    if (jobMatch.status !== "completed") {
      return NextResponse.json(
        { error: "Job match analysis must be completed first" },
        { status: 400 }
      );
    }

    // 3. Check user has sufficient credits (2 credits for optimization)
    const userId = jobMatch.cv_analyses.user_id;
    const { data: creditsData } = await supabaseAdmin
      .from("user_credits")
      .select("credits")
      .eq("user_id", userId)
      .single();

    if (!creditsData || creditsData.credits < 2) {
      return NextResponse.json(
        { error: "Insufficient credits. 2 credits required for CV optimization." },
        { status: 402 }
      );
    }

    // 4. Check if optimization already exists
    const { data: existingOptimization } = await supabaseAdmin
      .from("optimized_cvs")
      .select("id")
      .eq("job_match_analysis_id", jobMatchAnalysisId)
      .maybeSingle();

    if (existingOptimization) {
      return NextResponse.json({
        success: true,
        optimizedCvId: existingOptimization.id,
        message: "CV already optimized for this job",
      });
    }

    // 5. Create optimized CV record
    const { data: optimizedCvData, error: optimizedCvError } = await supabaseAdmin
      .from("optimized_cvs")
      .insert({
        user_id: userId,
        job_match_analysis_id: jobMatchAnalysisId,
        optimized_content: "",
        optimization_notes: [],
        status: "pending",
      })
      .select()
      .single();

    if (optimizedCvError) {
      throw optimizedCvError;
    }

    // 6. Update status to processing
    await supabaseAdmin
      .from("optimized_cvs")
      .update({ status: "processing" })
      .eq("id", optimizedCvData.id);

    // 7. Download original CV from storage
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("cv-uploads")
      .download(jobMatch.cv_analyses.file_url);

    if (downloadError) throw downloadError;

    // 8. Extract CV text using OpenAI Assistants API
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const file = await openai.files.create({
      file: new File([buffer], "cv.pdf", { type: "application/pdf" }),
      purpose: "assistants",
    });

    const assistant = await openai.beta.assistants.create({
      name: "CV Text Extractor",
      instructions: "Extract all text from the PDF file.",
      model: "gpt-4o",
      tools: [{ type: "file_search" }],
    });

    const thread = await openai.beta.threads.create({
      messages: [{
        role: "user",
        content: "Extract all text from this CV.",
        attachments: [{ file_id: file.id, tools: [{ type: "file_search" }] }],
      }],
    });

    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id,
    });

    const messages = await openai.beta.threads.messages.list(thread.id);
    const cvText = messages.data[0].content[0].type === "text"
      ? messages.data[0].content[0].text.value
      : "";

    // Cleanup OpenAI resources
    await openai.files.delete(file.id);
    await openai.beta.assistants.delete(assistant.id);

    // 9. Generate optimized CV with GPT-4o
    const optimizationResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Sen profesyonel bir CV yazarı ve kariyer koçusun. Verilen CV'yi, belirli bir iş ilanına göre optimize etmek için yeniden yazıyorsun.

GÖREV:
Mevcut CV'yi alarak, iş ilanına %100 uyumlu, ATS dostu ve profesyonel bir CV oluştur.

OPTİMİZASYON PRENSİPLERİ:
1. **Anahtar Kelime Optimizasyonu**: İş ilanındaki kritik terimleri doğal bir şekilde CV'ye entegre et
2. **Başarı Odaklı İfadeler**: Her deneyimi ölçülebilir başarılarla destekle (%X artış, Y proje tamamlandı, vb.)
3. **İş İlanına Uyum**: İş tanımındaki gereksinimleri CV'de öne çıkar
4. **Beceri Vurgusu**: Eksik becerileri ekle, mevcut becerileri güçlendir
5. **ATS Uyumluluğu**: Temiz formatla, net başlıklarla ve anahtar kelimelerle

OUTPUT FORMAT (JSON):
{
  "optimized_content": "Optimize edilmiş CV metni (Markdown formatında, detaylı ve profesyonel)",
  "optimization_notes": [
    "Yapılan iyileştirme 1",
    "Yapılan iyileştirme 2",
    "Eklenen beceri/vurgu 3",
    ...
  ]
}

NOTLAR:
- CV'yi Türkçe veya İngilizce olarak optimize et (iş ilanının diline göre)
- Markdown formatında temiz ve okunabilir şekilde yaz
- Gerçek bilgileri koru, sadece ifadeleri ve vurguları güçlendir
- Eksik becerileri makul seviyede ekle (iş deneyimine uygun şekilde)`,
        },
        {
          role: "user",
          content: `İŞ İLANI:
Pozisyon: ${jobMatch.job_title}
${jobMatch.company_name ? `Şirket: ${jobMatch.company_name}` : ""}

${jobMatch.job_description}

---

MEVCUT CV:
${cvText}

---

ANALIZ SONUÇLARI:
Uyum Skoru: ${jobMatch.match_score}%
Eksik Beceriler: ${JSON.stringify(jobMatch.missing_skills)}
Mevcut Güçlü Yönler: ${JSON.stringify(jobMatch.existing_strengths)}
Öneriler: ${JSON.stringify(jobMatch.recommendations)}

Lütfen bu CV'yi yukarıdaki iş ilanı için optimize et.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const optimization = JSON.parse(optimizationResponse.choices[0].message.content || "{}");

    // 10. Save optimized CV
    await supabaseAdmin
      .from("optimized_cvs")
      .update({
        optimized_content: optimization.optimized_content,
        optimization_notes: optimization.optimization_notes,
        status: "completed",
      })
      .eq("id", optimizedCvData.id);

    // 11. Deduct 2 credits
    await supabaseAdmin.rpc("decrement_credits", {
      user_uuid: userId,
      credit_amount: 2,
    });

    return NextResponse.json({
      success: true,
      optimizedCvId: optimizedCvData.id,
    });

  } catch (error: any) {
    console.error("CV optimization error:", error);

    return NextResponse.json(
      { error: error.message || "CV optimization failed" },
      { status: 500 }
    );
  }
}
