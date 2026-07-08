import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { studentProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateIEDCId } from "@/lib/iedc-id";
import { generateQRSecret, generateQRDataURL } from "@/lib/qr";
import { NextResponse } from "next/server";

async function getSession() {
  return await auth.api.getSession({ headers: await headers() });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "student") {
    return NextResponse.json({ error: "Forbidden — Only students require onboarding" }, { status: 403 });
  }

  // Check if profile already exists
  const [existing] = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, session.user.id));

  if (existing) {
    return NextResponse.json({ error: "Profile already completed" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name, admissionNumber, department, batch, phone } = body as {
      name: string;
      admissionNumber: string;
      department: string;
      batch: string;
      phone: string;
    };

    if (!name || !admissionNumber || !department || !batch || !phone) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check unique constraints for admission number
    const [existingAdmission] = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.admissionNumber, admissionNumber));

    if (existingAdmission) {
      return NextResponse.json({ error: "This admission number is already registered" }, { status: 409 });
    }

    // Extract graduation year from batch (e.g. "2023-2027" -> 2027)
    const yearParts = batch.split("-");
    const graduationYear = parseInt(yearParts[1] || yearParts[0]) || (new Date().getFullYear() + 4);

    // Generate IEDC ID
    const iecdId = await generateIEDCId(department, graduationYear);

    // Generate QR secret
    const qrSecret = generateQRSecret();

    // Create student profile
    const [profile] = await db
      .insert(studentProfiles)
      .values({
        userId: session.user.id,
        iecdId,
        name,
        admissionNumber,
        department,
        batch,
        phone,
        qrHmacSecret: qrSecret,
      })
      .returning();

    // Generate QR code data URL
    const qrCodeUrl = await generateQRDataURL(profile.id, iecdId, qrSecret);

    // Update profile with QR URL
    await db
      .update(studentProfiles)
      .set({ qrCodeUrl })
      .where(eq(studentProfiles.id, profile.id));

    return NextResponse.json({ success: true, message: "Onboarding completed successfully" }, { status: 201 });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
