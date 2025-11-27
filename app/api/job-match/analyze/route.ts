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
    const { cvAnalysisId, jobTitle, companyName, jobDescription } = await req.json();

    // 1. Validation
    if (!cvAnalysisId || !jobTitle || !jobDescription) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (jobDescription.length > 10000) {
      return NextResponse.json(
        { error: "Job description too long (max 10000 characters)" },
        { status: 400 }
      );
    }

    // 2. Verify CV analysis exists and is completed
    const { data: cvAnalysis, error: cvError } = await supabaseAdmin
      .from("cv_analyses")
      .select("*, analysis_results(*)")
      .eq("id", cvAnalysisId)
      .single();

    if (cvError || !cvAnalysis) {
      return NextResponse.json(
        { error: "CV analysis not found" },
        { status: 404 }
      );
    }

    if (cvAnalysis.status !== "completed") {
      return NextResponse.json(
        { error: "CV analysis must be completed first" },
        { status: 400 }
      );
    }

    // 3. Check user has sufficient credits
    const { data: creditsData } = await supabaseAdmin
      .from("user_credits")
      .select("credits")
      .eq("user_id", cvAnalysis.user_id)
      .single();

    if (!creditsData || creditsData.credits < 1) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    // 4. Create job match analysis record
    const { data: jobMatchData, error: jobMatchError } = await supabaseAdmin
      .from("job_match_analyses")
      .insert({
        user_id: cvAnalysis.user_id,
        cv_analysis_id: cvAnalysisId,
        job_title: jobTitle,
        company_name: companyName || null,
        job_description: jobDescription,
        status: "pending",
      })
      .select()
      .single();

    if (jobMatchError) {
      throw jobMatchError;
    }

    // 5. Update status to processing
    await supabaseAdmin
      .from("job_match_analyses")
      .update({ status: "processing" })
      .eq("id", jobMatchData.id);

    // 6. Download CV file from storage
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("cv-uploads")
      .download(cvAnalysis.file_url);

    if (downloadError) throw downloadError;

    // 7. Extract CV text using OpenAI Assistants API
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

    // 8. Perform job match analysis with GPT-4o
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Sen profesyonel bir iş eşleştirme ve kariyer danışmanısın. CV ile iş ilanı arasındaki uyumu analiz edersin.

Verilen CV ve iş ilanını detaylı şekilde analiz et ve şu JSON formatında döndür:
{
  "match_score": 0-100 arası uyum skoru (integer),
  "missing_skills": ["eksik beceri 1", "eksik beceri 2", ...],
  "existing_strengths": ["CV'de var olan ve iş için uygun beceri 1", "CV'de var olan ve iş için uygun beceri 2", ...],
  "recommendations": ["CV'ye eklenebilecek öneri 1", "vurgulanması gereken nokta 2", ...],
  "keyword_analysis": {
    "required_keywords": ["iş ilanındaki kritik anahtar kelimeler"],
    "cv_keywords": ["CV'deki mevcut anahtar kelimeler"],
    "matched": ["eşleşen kelimeler"],
    "missing": ["eksik kelimeler"]
  },
  "detailed_feedback": "Detaylı geri bildirim (3-4 paragraf, Türkçe)"
}

Değerlendirme Kriterleri ve Ağırlıkları:
- Teknik beceri eşleşmesi (30%): Programlama dilleri, araçlar, teknolojiler
- Deneyim seviyesi uyumu (25%): Yıl bazında deneyim, pozisyon seviyeleri
- Eğitim gereksinimi (15%): Diploma, sertifikalar
- Soft skills (15%): İletişim, liderlik, takım çalışması vb.
- Anahtar kelime kullanımı (15%): İş ilanındaki önemli terimlerin CV'de geçmesi

Match Score Hesaplama Rehberi:
- 90-100: Mükemmel uyum, hemen başvurmalı
- 80-89: Çok iyi uyum, güçlü aday
- 70-79: İyi uyum, bazı eksiklikler var ama uygun
- 60-69: Orta seviye uyum, önemli geliştirmeler gerekli
- 50-59: Zayıf uyum, büyük boşluklar var
- 0-49: Çok zayıf uyum, pozisyon için uygun değil

Türkçe yanıt ver ve profesyonel ol.`,
        },
        {
          role: "user",
          content: `İŞ İLANI:
Pozisyon: ${jobTitle}
${companyName ? `Şirket: ${companyName}` : ""}

${jobDescription}

---

CV:
${cvText}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const analysis = JSON.parse(analysisResponse.choices[0].message.content || "{}");

    // 9. Save analysis results
    await supabaseAdmin
      .from("job_match_analyses")
      .update({
        match_score: analysis.match_score,
        missing_skills: analysis.missing_skills,
        existing_strengths: analysis.existing_strengths,
        recommendations: analysis.recommendations,
        keyword_analysis: analysis.keyword_analysis,
        detailed_feedback: analysis.detailed_feedback,
        status: "completed",
      })
      .eq("id", jobMatchData.id);

    // 10. Deduct 1 credit
    await supabaseAdmin.rpc("decrement_credits", {
      user_uuid: cvAnalysis.user_id,
      credit_amount: 1,
    });

    return NextResponse.json({
      success: true,
      jobMatchId: jobMatchData.id,
    });

  } catch (error: any) {
    console.error("Job match analysis error:", error);

    // Try to update status to failed
    try {
      const body = await req.clone().json();
      if (body.jobMatchId) {
        await supabaseAdmin
          .from("job_match_analyses")
          .update({ status: "failed" })
          .eq("id", body.jobMatchId);
      }
    } catch (e) {
      // Ignore if body already consumed
    }

    return NextResponse.json(
      { error: error.message || "Job match analysis failed" },
      { status: 500 }
    );
  }
}
