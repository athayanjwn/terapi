import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Bypass untuk static files & api (optional, tapi aman)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // Jangan redirect kalau sudah di halaman login
  if (pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("access_token")?.value;

  // Jika tidak ada token => redirect ke /login + next
  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/me/:path*",
    "/appointment/:path*", 
  ],
};
