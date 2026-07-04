import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const isAdminPage =
    pathname === "/admin-gk-manage" ||
    pathname.startsWith("/admin-gk-manage/");

  if (!isAdminPage) {
    return NextResponse.next();
  }

  return new NextResponse("middleware works", {
    status: 200,
  });
}

export const config = {
  matcher: ["/admin-gk-manage", "/admin-gk-manage/:path*"],
};