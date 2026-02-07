import { NextResponse } from "next/server";

const PUBLIC_PATH = "/login";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Explicitly allow login
  if (pathname === PUBLIC_PATH) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get("auth_token")?.value;

  if (!authToken) {
    return NextResponse.redirect(new URL(PUBLIC_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login"],
};
