import { NextResponse, type NextRequest } from "next/server";
import { decryptSession, SESSION_COOKIE_NAME } from "@/lib/session";

const clerkOnlyPrefixes = ["/painel"];
const adminPrefixes = ["/admin"];
const adminPublicPrefixes = [
  "/admin/login",
  "/admin/esqueci-senha",
  "/admin/recuperar-senha",
];
const publicOnlyPrefixes = [
  "/login",
  "/cadastro",
  "/esqueci-senha",
  "/recuperar-senha",
];

function matches(path: string, prefix: string) {
  return path === prefix || path.startsWith(prefix + "/");
}

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await decryptSession(token);

  const isAdminPublic = adminPublicPrefixes.some((p) => matches(path, p));
  const isAdminProtected =
    !isAdminPublic && adminPrefixes.some((p) => matches(path, p));
  const isClerkProtected = clerkOnlyPrefixes.some((p) => matches(path, p));
  const isPublicOnly = publicOnlyPrefixes.some((p) => matches(path, p));

  if (isAdminProtected) {
    if (!session || session.kind !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
    }
  }

  if (isClerkProtected) {
    if (!session || session.kind !== "clerk") {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
  }

  if (isPublicOnly && session?.kind === "clerk") {
    return NextResponse.redirect(new URL("/painel", req.nextUrl));
  }

  if (isAdminPublic && session?.kind === "admin") {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$|.*\\.png$).*)"],
};
