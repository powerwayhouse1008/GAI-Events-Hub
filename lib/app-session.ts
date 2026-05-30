import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "gai_session";
const MAX_AGE = 60 * 60 * 24 * 30;

function getSecret() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function createAppSessionValue(userId: string) {
  const payload = JSON.stringify({ userId, createdAt: Date.now() });
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function readAppSessionValue(value?: string | null) {
  if (!value || !getSecret()) return null;

  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as {
      userId?: string;
    };
    return payload.userId || null;
  } catch {
    return null;
  }
}

export async function getAppSessionUserId() {
  const cookieStore = await cookies();
  return readAppSessionValue(cookieStore.get(COOKIE_NAME)?.value);
}

export function setAppSessionCookie(response: Response, userId: string) {
  const headers = response.headers as Headers & {
    append(name: string, value: string): void;
  };
  const value = createAppSessionValue(userId);
  headers.append(
    "Set-Cookie",
    `${COOKIE_NAME}=${value}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax; Secure; HttpOnly`
  );
}

export function clearAppSessionCookie(response: Response) {
  response.headers.append(
    "Set-Cookie",
    `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax; Secure; HttpOnly`
  );
}
