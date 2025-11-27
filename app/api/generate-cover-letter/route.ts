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
    const { cvAnalysisId, jobTitle, companyName, jobDescription, language } = await req.json();

    // Validate required fields
    if (!cvAnalysisId || !jobTitle || !jobDescription || !language) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate language
    if (!["tr", "en"].includes(language)) {
      return NextResponse.json(
        { error: "Invalid language. Must be 'tr' or 'en'" },
        { status: 400 }
      );
    }

    // Validate job description length
    if (jobDescription.length > 5000) {
      return NextResponse.json(
        { error: "Job description too long (max 5000 characters)" },
        { status: 400 }
      );
    }

    // Get CV analysis to extract CV text and verify it's completed
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

    // Create cover letter record with pending status
    const { data: coverLetterData, error: coverLetterError } = await supabaseAdmin
      .from("cover_letters")
      .insert({
        user_id: cvAnalysis.user_id,
        cv_analysis_id: cvAnalysisId,
        job_title: jobTitle,
        company_name: companyName || null,
        job_description: jobDescription,
        language: language,
        status: "pending",
      })
      .select()
      .single();

    if (coverLetterError) {
      throw coverLetterError;
    }

    // Update status to processing
    await supabaseAdmin
      .from("cover_letters")
      .update({ status: "processing" })
      .eq("id", coverLetterData.id);

    // Download CV file from storage to extract text
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("cv-uploads")
      .download(cvAnalysis.file_url);

    if (downloadError) {
      throw downloadError;
    }

    // Convert to buffer for OpenAI
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file to OpenAI for parsing
    const file = await openai.files.create({
      file: new File([buffer], "cv.pdf", { type: "application/pdf" }),
      purpose: "assistants",
    });

    // Create assistant with file parsing capability
    const assistant = await openai.beta.assistants.create({
      name: "CV Text Extractor",
      instructions: "Sen bir CV okuma asistanısın. PDF dosyasındaki tüm metni çıkar ve döndür.",
      model: "gpt-4o",
      tools: [{ type: "file_search" }],
    });

    // Create thread and attach file
    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: "Bu CV dosyasındaki tüm metni çıkar ve bana ver.",
          attachments: [{ file_id: file.id, tools: [{ type: "file_search" }] }],
        },
      ],
    });

    // Run assistant
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id,
    });

    // Get extracted text
    const messages = await openai.beta.threads.messages.list(thread.id);
    const cvText = messages.data[0].content[0].type === "text"
      ? messages.data[0].content[0].text.value
      : "";

    // Cleanup OpenAI resources
    await openai.files.delete(file.id);
    await openai.beta.assistants.delete(assistant.id);

    // Generate cover letter with GPT-4o
    const systemPrompt = language === "tr"
      ? `Sen profesyonel bir ön yazı (cover letter) yazarısın. CV ve iş ilanı verilen kişiler için etkileyici, kişiselleştirilmiş ön yazılar oluşturursun.

Verilen CV ve iş ilanına göre profesyonel bir ön yazı yaz:
1. İş pozisyonuna ve şirkete özel olmalı
2. CV'deki ilgili deneyimleri vurgula
3. Pozisyon için uygunluk ve istekliliği göster
4. Profesyonel ama samimi bir dil kullan
5. 3-4 paragraf uzunluğunda olsun (250-400 kelime)
6. Standart ön yazı formatını takip et
7. Türkçe yaz

Sadece ön yazı metnini döndür, başka açıklama ekleme.`
      : `You are a professional cover letter writer with expertise in creating compelling, personalized cover letters.

Given a CV and job description, write a professional cover letter that:
1. Addresses the specific role and company
2. Highlights relevant experience from the CV
3. Demonstrates enthusiasm and fit for the position
4. Uses professional but engaging language
5. Keeps length to 3-4 paragraphs (250-400 words)
6. Follows standard cover letter format
7. Written in English

Return only the cover letter text, no additional explanations.`;

    const userPrompt = `
İş Pozisyonu: ${jobTitle}
${companyName ? `Şirket: ${companyName}` : ""}

İş İlanı:
${jobDescription}

CV:
${cvText}
`;

    const coverLetterResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
    });

    const generatedLetter = coverLetterResponse.choices[0].message.content || "";

    // Save generated cover letter
    await supabaseAdmin
      .from("cover_letters")
      .update({
        generated_letter: generatedLetter,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", coverLetterData.id);

    // Deduct 1 credit from user
    await supabaseAdmin.rpc("decrement_credits", {
      user_uuid: cvAnalysis.user_id,
    });

    return NextResponse.json({
      success: true,
      coverLetterId: coverLetterData.id
    });
  } catch (error: any) {
    console.error("Cover letter generation error:", error);

    // Try to update status to failed
    try {
      const body = await req.clone().json();
      if (body.coverLetterId) {
        await supabaseAdmin
          .from("cover_letters")
          .update({ status: "failed" })
          .eq("id", body.coverLetterId);
      }
    } catch (e) {
      // Ignore if body already consumed
    }

    return NextResponse.json(
      { error: error.message || "Cover letter generation failed" },
      { status: 500 }
    );
  }
}
