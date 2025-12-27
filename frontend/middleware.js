import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("access-token");
  const pathname = req.nextUrl.pathname;

  const isProtectedPage =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/appointment") ||
    pathname.startsWith("/konselor");

  if (isProtectedPage && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/appointment/:path*",
    "/konselor/:path*",
  ],
};
