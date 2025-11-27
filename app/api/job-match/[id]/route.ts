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

    const { data: jobMatch, error } = await supabaseAdmin
      .from("job_match_analyses")
      .select(`
        *,
        cv_analyses (
          file_name
        ),
        optimized_cvs (id)
      `)
      .eq("id", id)
      .single();

    if (error || !jobMatch) {
      return NextResponse.json(
        { error: "Job match analysis not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(jobMatch);
  } catch (error: any) {
    console.error("Fetch job match error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch job match" },
      { status: 500 }
    );
  }
}
