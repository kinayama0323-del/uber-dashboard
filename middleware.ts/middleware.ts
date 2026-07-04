import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const isAdminPage =
    pathname === "/admin-gk-manage" ||
    pathname.startsWith("/admin-gk-manage/");

  if (!isAdminPage) {
    return NextResponse.next();
  }

  const auth = req.headers.get("authorization");

  if (auth) {
    const [, encoded] = auth.split(" ");
    const [user, pass] = atob(encoded).split(":");

    if (
      user === process.env.ADMIN_USER &&
      pass === process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Area"',
    },
  });
}

export const config = {
  matcher: ["/admin-gk-manage", "/admin-gk-manage/:path*"],
};