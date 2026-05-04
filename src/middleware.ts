export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/profile/:path*",
    "/api/links/:path*",
    "/api/analytics/:path*",
  ],
};
