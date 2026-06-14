import crypto from "crypto";
import QRCode from "qrcode";

interface QRPayload {
  uid: string;
  iid: string;
  ts: number;
  h: string;
}

export const QR_WINDOW_SECONDS = 30;
const ACCEPTED_WINDOWS = 2;

const CIPHER_PREFIX = "IEDC:";

function getEncryptionKey(): Buffer {
  const pepper = process.env.QR_GLOBAL_PEPPER;
  if (!pepper || pepper === "generate-with-openssl-rand-hex-32") {
    throw new Error(
      "QR_GLOBAL_PEPPER is not set. Run `openssl rand -hex 32` and add it to .env"
    );
  }
  return crypto.createHash("sha256").update(pepper).digest();
}

function encryptPayload(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag(); // 16 bytes

  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decryptPayload(cipherB64: string): string | null {
  try {
    const key = getEncryptionKey();
    const buf = Buffer.from(cipherB64, "base64");

    const iv = buf.subarray(0, 12);
    const authTag = buf.subarray(12, 28);
    const ciphertext = buf.subarray(28);

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    return null;
  }
}

export function currentWindowSlot(): number {
  return Math.floor(Date.now() / 1000 / QR_WINDOW_SECONDS);
}

export function secondsUntilNextWindow(): number {
  return QR_WINDOW_SECONDS - (Math.floor(Date.now() / 1000) % QR_WINDOW_SECONDS);
}

export function generateQRSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

function hmacForWindow(uid: string, iecdId: string, secret: string, slot: number): string {
  return crypto
    .createHmac("sha256", secret)
    .update(`${uid}:${iecdId}:${slot}`)
    .digest("hex")
    .substring(0, 24);
}

export function buildDynamicQRPayload(uid: string, iecdId: string, secret: string): string {
  const ts = currentWindowSlot();
  const h = hmacForWindow(uid, iecdId, secret, ts);
  const payload: QRPayload = { uid, iid: iecdId, ts, h };
  return CIPHER_PREFIX + encryptPayload(JSON.stringify(payload));
}

export async function generateDynamicQRDataURL(uid: string, iecdId: string, secret: string): Promise<string> {
  return QRCode.toDataURL(buildDynamicQRPayload(uid, iecdId, secret), {
    errorCorrectionLevel: "H",
    width: 400,
    margin: 3,
    color: { dark: "#1a1a2e", light: "#ffffff" },
  });
}

export function verifyDynamicQRPayload(
  rawPayload: string,
  storedSecret: string
): { valid: boolean; uid?: string; iecdId?: string } {
  try {
    let jsonStr: string;

    if (rawPayload.startsWith(CIPHER_PREFIX)) {
      const decrypted = decryptPayload(rawPayload.slice(CIPHER_PREFIX.length));
      if (!decrypted) return { valid: false };
      jsonStr = decrypted;
    } else {
      jsonStr = rawPayload;
    }

    const payload: QRPayload = JSON.parse(jsonStr);
    if (!payload.uid || !payload.iid || !payload.ts || !payload.h) return { valid: false };

    const now = currentWindowSlot();

    for (let i = 0; i < ACCEPTED_WINDOWS; i++) {
      const slot = now - i;
      if (slot !== payload.ts) continue;

      const expected = hmacForWindow(payload.uid, payload.iid, storedSecret, slot);
      const isValid = crypto.timingSafeEqual(
        Buffer.from(payload.h, "hex"),
        Buffer.from(expected, "hex")
      );
      if (isValid) return { valid: true, uid: payload.uid, iecdId: payload.iid };
    }

    return { valid: false };
  } catch {
    return { valid: false };
  }
}

// Legacy aliases
export function buildQRPayload(uid: string, iecdId: string, secret: string): string {
  return buildDynamicQRPayload(uid, iecdId, secret);
}
export async function generateQRDataURL(uid: string, iecdId: string, secret: string): Promise<string> {
  return generateDynamicQRDataURL(uid, iecdId, secret);
}
export function verifyQRPayload(rawPayload: string, storedSecret: string) {
  return verifyDynamicQRPayload(rawPayload, storedSecret);
}