import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


export function proxy(req: NextRequest) {
  const token = req.cookies.get('token')
  console.log('-------------------------')
  console.log("Middleware token is:", token);

  const protectedRoutes = ["/sell", "/buy", "/profile", "/gifts"];

  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );
  
 
  return NextResponse.next();
}

export const config = {
  matcher: ["/buy/:path*", "/sell/:path*", "/profile/:path*", "/gifts/:path*", "/orderPickup/:path*"],
};
