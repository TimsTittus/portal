import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { studentProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateQRSecret, generateQRDataURL } from "@/lib/qr";
import { NextResponse } from "next/server";

async function getSession() {
  return await auth.api.getSession({ headers: await headers() });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profile] = await db
    .select({
      qrCodeUrl: studentProfiles.qrCodeUrl,
      iecdId: studentProfiles.iecdId,
    })
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, session.user.id));

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

// Regenerate QR code with a new secret
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profile] = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, session.user.id));

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const newSecret = generateQRSecret();
  const qrCodeUrl = await generateQRDataURL(
    session.user.id,
    profile.iecdId,
    newSecret
  );

  await db
    .update(studentProfiles)
    .set({ qrHmacSecret: newSecret, qrCodeUrl, updatedAt: new Date() })
    .where(eq(studentProfiles.id, profile.id));

  return NextResponse.json({ qrCodeUrl, message: "QR code regenerated" });
}
