import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getEnv } from "@/lib/env";

export async function GET() {
  try {
    const env = getEnv();

    await db.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        ok: true,
        status: "ready",
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        status: "not_ready",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
