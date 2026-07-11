import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  const protectedRoutes = ["/sell", "/customer", "/chat", "/admin", "/cart/checkout"];

  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  if (isProtected && !token) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("redirectTo", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/sell/:path*",
    "/customer/:path*",
    "/chat/:path*",
    "/admin/:path*",
    "/cart/checkout"
  ],
};
