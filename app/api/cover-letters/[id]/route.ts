import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log("Fetching cover letter with ID:", id);

    // Fetch cover letter with related CV analysis info (using admin client to bypass RLS)
    const { data: coverLetter, error } = await supabaseAdmin
      .from("cover_letters")
      .select(`
        *,
        cv_analyses (
          file_name
        )
      `)
      .eq("id", id)
      .single();

    console.log("Cover letter data:", coverLetter);
    console.log("Error:", error);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Cover letter not found", details: error.message },
        { status: 404 }
      );
    }

    if (!coverLetter) {
      return NextResponse.json(
        { error: "Cover letter not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(coverLetter);
  } catch (error: any) {
    console.error("Fetch cover letter error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch cover letter" },
      { status: 500 }
    );
  }
}
