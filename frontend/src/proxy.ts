import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;

    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (pathname.startsWith("/dashboard") && role === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
