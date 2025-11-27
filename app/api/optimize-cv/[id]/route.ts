import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: optimizedCv, error } = await supabaseAdmin
      .from("optimized_cvs")
      .select(`
        *,
        job_match_analyses (
          job_title,
          company_name,
          match_score,
          cv_analyses (
            file_name
          )
        )
      `)
      .eq("id", id)
      .single();

    if (error || !optimizedCv) {
      return NextResponse.json(
        { error: "Optimized CV not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(optimizedCv);
  } catch (error: any) {
    console.error("Fetch optimized CV error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch optimized CV" },
      { status: 500 }
    );
  }
}
