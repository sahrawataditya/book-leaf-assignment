import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isLoginPage = pathname === "/login";
  const isAuthorRoute = pathname.startsWith("/author");
  const isAdminRoute = pathname.startsWith("/admin");
  const isApiAuth = pathname.startsWith("/api/auth");
  const isApiSSE = pathname.startsWith("/api/sse");
  const isApiRoute = pathname.startsWith("/api");

  if (isApiAuth || isApiSSE) return NextResponse.next();

  if (!session && !isLoginPage && (isAuthorRoute || isAdminRoute || isApiRoute)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (session) {
    const role = (session.user as any)?.role;

    if (isLoginPage) {
      const redirect = role === "ADMIN" ? "/admin" : "/author";
      return NextResponse.redirect(new URL(redirect, req.url));
    }

    if (isAdminRoute && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/author", req.url));
    }

    if (isAuthorRoute && role !== "AUTHOR") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
