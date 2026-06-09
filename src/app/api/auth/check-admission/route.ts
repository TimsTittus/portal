import { db } from "@/db";
import { studentProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const admissionNumber = searchParams.get("admissionNumber");

    if (!admissionNumber) {
      return NextResponse.json(
        { error: "Admission number is required" },
        { status: 400 }
      );
    }

    const existingStudent = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.admissionNumber, admissionNumber));

    return NextResponse.json({
      available: existingStudent.length === 0,
    });
  } catch (error) {
    console.error("Check admission number error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}