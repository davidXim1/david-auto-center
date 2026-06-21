export interface AdminSessionPayload {
  email: string;
  role: "Administrador" | "Gerente" | "Atendente";
  iat: number;
  exp: number;
}

export const ADMIN_SESSION_COOKIE = "dac_admin_session";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const fallbackSecret = "dev-only-david-auto-center-change-this-secret";

function getSecret() {
  return process.env.AUTH_SECRET || fallbackSecret;
}

export function isMissingProductionAuthConfig() {
  return process.env.NODE_ENV === "production" && (!(process.env.ADMIN_LOGIN || process.env.ADMIN_EMAIL) || !process.env.ADMIN_PASSWORD || !process.env.AUTH_SECRET);
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function encodeJson(value: unknown) {
  return bytesToBase64Url(encoder.encode(JSON.stringify(value)));
}

function decodeJson<T>(value: string): T {
  return JSON.parse(decoder.decode(base64UrlToBytes(value))) as T;
}

async function getSigningKey() {
  return crypto.subtle.importKey("raw", encoder.encode(getSecret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function signPayload(payload: unknown) {
  const body = encodeJson(payload);
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return `${body}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

async function verifyPayload<T>(token?: string) {
  if (!token) {
    return null;
  }

  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }

  try {
    const key = await getSigningKey();
    const valid = await crypto.subtle.verify("HMAC", key, base64UrlToBytes(signature), encoder.encode(body));
    if (!valid) {
      return null;
    }

    const payload = decodeJson<T & { exp?: number }>(body);
    if (!payload.exp || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function signAdminSession(payload: AdminSessionPayload) {
  return signPayload(payload);
}

export async function verifyAdminSession(token?: string) {
  const payload = await verifyPayload<AdminSessionPayload>(token);
  return payload?.email ? payload : null;
}

export function constantTimeEqual(a: string, b: string) {
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  const length = Math.max(left.length, right.length);
  let diff = left.length ^ right.length;

  for (let index = 0; index < length; index += 1) {
    diff |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }

  return diff === 0;
}
