import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getOrCreateRequestId } from "@/lib/request-id";

export function proxy(request: NextRequest) {
  const requestId = getOrCreateRequestId(request);
  const response = NextResponse.next();

  response.headers.set("x-request-id", requestId);
  response.headers.set("x-app-version", process.env.npm_package_version ?? "unknown");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
