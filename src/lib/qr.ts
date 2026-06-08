import crypto from "crypto";
import QRCode from "qrcode";

interface QRPayload {
  uid: string;
  iid: string;
  h: string;
}

export function generateQRSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function buildQRPayload(
  userId: string,
  iecdId: string,
  secret: string
): string {
  const data = `${userId}:${iecdId}`;
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("hex")
    .substring(0, 24);

  const payload: QRPayload = { uid: userId, iid: iecdId, h: hmac };
  return JSON.stringify(payload);
}

export async function generateQRDataURL(
  userId: string,
  iecdId: string,
  secret: string
): Promise<string> {
  const payload = buildQRPayload(userId, iecdId, secret);

  const dataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "H",
    width: 400,
    margin: 3,
    color: { dark: "#1a1a2e", light: "#ffffff" },
  });

  return dataUrl;
}

export function verifyQRPayload(
  rawPayload: string,
  storedSecret: string
): { valid: boolean; userId?: string; iecdId?: string } {
  try {
    const payload: QRPayload = JSON.parse(rawPayload);

    if (!payload.uid || !payload.iid || !payload.h) {
      return { valid: false };
    }

    const data = `${payload.uid}:${payload.iid}`;
    const expectedHmac = crypto
      .createHmac("sha256", storedSecret)
      .update(data)
      .digest("hex")
      .substring(0, 24);

    const isValid = crypto.timingSafeEqual(
      Buffer.from(payload.h, "hex"),
      Buffer.from(expectedHmac, "hex")
    );

    if (!isValid) return { valid: false };

    return { valid: true, userId: payload.uid, iecdId: payload.iid };
  } catch {
    return { valid: false };
  }
}
