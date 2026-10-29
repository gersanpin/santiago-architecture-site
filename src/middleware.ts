import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { isBlockedPublicPath } from "./lib/blocked-public-paths";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  if (isBlockedPublicPath(request.nextUrl.pathname)) {
    return new NextResponse(null, { status: 404 });
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/(en|es)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
    "/projects/:path*/README.md",
    "/(en|es)/projects/:path*/README.md",
    "/:file((?:vercel|window|globe|next|file)\\.svg)",
  ],
};
