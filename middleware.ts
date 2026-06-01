export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/foods/:path*", "/weight/:path*", "/journal/:path*"],
};
