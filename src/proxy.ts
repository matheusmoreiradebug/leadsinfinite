import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "im_auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protege apenas rotas /dashboard/*
  if (pathname.startsWith("/dashboard")) {
    const auth = request.cookies.get(COOKIE_NAME)?.value;

    if (!auth || auth !== process.env.DASHBOARD_PASSWORD_HASH) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
