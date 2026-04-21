import { NextResponse } from "next/server";
import { clearTeacherSession } from "@/lib/auth";
import { enforceSameOrigin } from "@/lib/security";

export async function POST(request: Request) {
  const originError = enforceSameOrigin(request);
  if (originError) {
    return originError;
  }

  await clearTeacherSession();
  return NextResponse.json({ ok: true });
}
