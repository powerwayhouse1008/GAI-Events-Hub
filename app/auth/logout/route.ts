import { NextResponse } from "next/server";
import { clearAppSessionCookie } from "@/lib/app-session";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const response = NextResponse.redirect(new URL("/login", requestUrl.origin), { status: 303 });
  clearAppSessionCookie(response);
  return response;
}
