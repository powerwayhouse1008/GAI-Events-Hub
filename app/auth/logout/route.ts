import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { clearAppSessionCookie } from "@/lib/app-session";

export async function POST(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const cookiesToSet: { name: string; value: string; options: CookieOptions }[] = [];
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(items: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.push(...items);
        }
      }
    }
  );

  await supabase.auth.signOut();

  const response = NextResponse.redirect(new URL("/login", requestUrl.origin), { status: 303 });
  cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  clearAppSessionCookie(response);
  return response;
}
