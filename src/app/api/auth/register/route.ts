import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { users, studentProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { registerSchema } from "@/lib/validators";
import { generateIEDCId } from "@/lib/iedc-id";
import { generateQRSecret, generateQRDataURL } from "@/lib/qr";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password, admissionNumber, department, batch, phone } =
      parsed.data;

    // Check if admission number already exists
    const existingStudent = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.admissionNumber, admissionNumber));

    if (existingStudent.length > 0) {
      return NextResponse.json(
        { error: "This admission number is already registered" },
        { status: 409 }
      );
    }

    // Create user via Better Auth
    const signUpResult = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        role: "student",
      },
    });

    if (!signUpResult) {
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      );
    }

    // Get the created user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      return NextResponse.json(
        { error: "User creation failed" },
        { status: 500 }
      );
    }

    // Generate IEDC ID
    const graduationYear = parseInt(batch) || (new Date().getFullYear() + 4);
    const iecdId = await generateIEDCId(department, graduationYear);

    // Generate QR secret
    const qrSecret = generateQRSecret();

    // Create student profile
    const [profile] = await db
      .insert(studentProfiles)
      .values({
        userId: user.id,
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
    const qrCodeUrl = await generateQRDataURL(user.id, iecdId, qrSecret);

    // Update profile with QR URL
    await db
      .update(studentProfiles)
      .set({ qrCodeUrl })
      .where(eq(studentProfiles.id, profile.id));

    return NextResponse.json(
      {
        message: "Registration successful",
        iecdId,
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}