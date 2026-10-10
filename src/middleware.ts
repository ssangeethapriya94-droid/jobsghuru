import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // 1. Platform Admin workspace protection (/admin/*)
  if (pathname.startsWith("/admin")) {
    const sessionToken = request.cookies.get("cb_admin_session")?.value;

    if (pathname === "/admin/login") {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    if (!sessionToken) {
      const loginUrl = new URL("/admin/login", request.url);
      if (pathname !== "/admin" && pathname !== "/admin/dashboard") {
        loginUrl.searchParams.set("from", pathname);
      }
      return NextResponse.redirect(loginUrl);
    }

    if (pathname === "/admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  // 2. Employer workspace protection (/employer/*)
  if (pathname.startsWith("/employer/") || pathname === "/employer") {
    const employerSessionToken = request.cookies.get("cb_employer_session")?.value;

    // Exempt public employer authentication routes
    const isPublicEmployerRoute =
      pathname === "/employer/login" ||
      pathname === "/employer/forgot-password" ||
      pathname === "/employer/reset-password";

    if (isPublicEmployerRoute) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    if (pathname === "/employer") {
      if (employerSessionToken) {
        return NextResponse.redirect(new URL("/employer/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/employer/login", request.url));
    }

    if (!employerSessionToken) {
      const loginUrl = new URL("/employer/login", request.url);
      if (pathname !== "/employer/dashboard") {
        loginUrl.searchParams.set("from", pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Candidate workspace protection (/candidate/*)
  if (pathname.startsWith("/candidate")) {
    // Exempt public candidate auth and token-based guest routes
    const isPublicCandidateRoute =
      pathname === "/candidate/login" ||
      pathname === "/candidate/signup" ||
      pathname === "/candidate/verify-email" ||
      pathname === "/candidate/forgot-password" ||
      pathname === "/candidate/reset-password" ||
      pathname.startsWith("/candidate/interviews/") ||
      pathname.startsWith("/candidate/assessments/");

    const candidateSessionToken = request.cookies.get("cb_candidate_session")?.value;

    if (pathname === "/candidate/login" || pathname === "/candidate/signup") {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // If candidate visits bare /candidate
    if (pathname === "/candidate") {
      if (candidateSessionToken) {
        return NextResponse.redirect(new URL("/candidate/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/candidate/login", request.url));
    }

    // If not a public route and no candidate session, redirect to candidate login
    if (!isPublicCandidateRoute && !candidateSessionToken) {
      const loginUrl = new URL("/candidate/login", request.url);
      if (pathname !== "/candidate/dashboard") {
        loginUrl.searchParams.set("from", pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/employer/:path*", "/candidate/:path*"],
};

