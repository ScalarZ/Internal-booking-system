import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./auth";

export default async function middleware(req: NextRequest) {
  const session = await auth();

  if (req.nextUrl.pathname === "/") {
    if (session) return NextResponse.redirect(new URL("/bookings", req.url));
    return NextResponse.next();
  }

  if (!session) return NextResponse.redirect(new URL("/", req.url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
