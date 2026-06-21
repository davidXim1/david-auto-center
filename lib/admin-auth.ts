import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/session";

export async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifyAdminSession(token);

  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Nao autorizado." }, { status: 401 })
    };
  }

  return { session, response: null };
}

export function redirectBack(request: NextRequest, hash = "") {
  const url = new URL(`/admin${hash}`, request.url);
  return NextResponse.redirect(url, { status: 303 });
}
