import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

const PUBLIC_PATHS = ["/auth/login", "/auth/register", "/auth/forgot-password"];
const ADMIN_PATHS = ["/admin"];

export const runtime = "experimental-edge";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes, API routes, and static files
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/register") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("sampadaa_session")?.value;
  const user = token ? await verifyToken(token) : null;

  // Redirect unauthenticated users
  if (!user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect non-admins from admin routes
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p)) && user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect root to appropriate home
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(user.role === "ADMIN" ? "/admin/analytics" : "/dashboard", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|api/auth/login|api/auth/register).*)",
  ],
};
