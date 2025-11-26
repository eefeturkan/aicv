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
    const { analysisId, fileName } = await req.json();

    if (!analysisId || !fileName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update analysis status to processing
    await supabaseAdmin
      .from("cv_analyses")
      .update({ status: "processing" })
      .eq("id", analysisId);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("cv-uploads")
      .download(fileName);

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

    // Cleanup
    await openai.files.delete(file.id);
    await openai.beta.assistants.delete(assistant.id);

    // Analyze CV with GPT-4
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Sen profesyonel bir CV danışmanısın. CV'leri detaylı bir şekilde analiz eder ve yapıcı geri bildirimler verirsin.

Analizini aşağıdaki JSON formatında döndür:
{
  "overall_score": 0-100 arası bir sayı,
  "summary": "CV'nin genel özeti (2-3 cümle)",
  "strengths": ["güçlü yön 1", "güçlü yön 2", ...],
  "weaknesses": ["zayıf yön 1", "zayıf yön 2", ...],
  "improvements": ["iyileştirme önerisi 1", "iyileştirme önerisi 2", ...],
  "section_scores": {
    "contact_info": 0-100,
    "summary": 0-100,
    "experience": 0-100,
    "education": 0-100,
    "skills": 0-100,
    "formatting": 0-100
  },
  "keywords": ["anahtar kelime 1", "anahtar kelime 2", ...],
  "ai_feedback": "Detaylı AI geri bildirimi (birkaç paragraf)"
}

Türkçe yanıt ver ve profesyonel ol.`,
        },
        {
          role: "user",
          content: `Aşağıdaki CV'yi analiz et:\n\n${cvText}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const analysis = JSON.parse(analysisResponse.choices[0].message.content || "{}");

    // Save analysis results
    const { error: insertError } = await supabaseAdmin
      .from("analysis_results")
      .insert({
        cv_analysis_id: analysisId,
        overall_score: analysis.overall_score,
        summary: analysis.summary,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        improvements: analysis.improvements,
        section_scores: analysis.section_scores,
        keywords: analysis.keywords,
        ai_feedback: analysis.ai_feedback,
      });

    if (insertError) {
      throw insertError;
    }

    // Update analysis status to completed
    await supabaseAdmin
      .from("cv_analyses")
      .update({ status: "completed" })
      .eq("id", analysisId);

    // Deduct 1 credit from user
    const { data: analysisData } = await supabaseAdmin
      .from("cv_analyses")
      .select("user_id")
      .eq("id", analysisId)
      .single();

    if (analysisData) {
      await supabaseAdmin.rpc("decrement_credits", {
        user_uuid: analysisData.user_id,
      });
    }

    return NextResponse.json({ success: true, analysisId });
  } catch (error: any) {
    console.error("Analysis error:", error);

    // Try to get analysisId from request body
    try {
      const body = await req.clone().json();
      if (body.analysisId) {
        await supabaseAdmin
          .from("cv_analyses")
          .update({ status: "failed" })
          .eq("id", body.analysisId);
      }
    } catch (e) {
      // Ignore if body already consumed
    }

    return NextResponse.json(
      { error: error.message || "Analysis failed" },
      { status: 500 }
    );
  }
}
