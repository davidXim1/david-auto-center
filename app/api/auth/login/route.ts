import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, constantTimeEqual, isMissingProductionAuthConfig, signAdminSession } from "@/lib/session";

const devLogin = "DAVIDAUTOCENTER";
const devPassword = "CENTERAUTO1";

function normalizeLogin(value: string) {
  return value.trim().toUpperCase();
}

function getExpectedLogin() {
  return normalizeLogin(process.env.ADMIN_LOGIN || process.env.ADMIN_EMAIL || devLogin);
}

function getExpectedPassword() {
  return process.env.ADMIN_PASSWORD || devPassword;
}

function safeRedirectTarget(value: FormDataEntryValue | null) {
  const target = typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/admin";
  return target.startsWith("/login") ? "/admin" : target;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const login = normalizeLogin(String(formData.get("login") || ""));
  const password = String(formData.get("password") || "");
  const redirect = safeRedirectTarget(formData.get("redirect"));

  if (isMissingProductionAuthConfig()) {
    const url = new URL("/login", request.url);
    url.searchParams.set("config", "1");
    return NextResponse.redirect(url, { status: 303 });
  }

  const loginOk = constantTimeEqual(login, getExpectedLogin());
  const passwordOk = constantTimeEqual(password, getExpectedPassword());

  if (!loginOk || !passwordOk) {
    const url = new URL("/login", request.url);
    url.searchParams.set("erro", "1");
    url.searchParams.set("redirect", redirect);
    return NextResponse.redirect(url, { status: 303 });
  }

  const now = Date.now();
  const maxAge = 60 * 60 * 8;
  const token = await signAdminSession({
    email: login,
    role: "Administrador",
    iat: now,
    exp: now + maxAge * 1000
  });

  const response = NextResponse.redirect(new URL(redirect, request.url), { status: 303 });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge
  });

  return response;
}
