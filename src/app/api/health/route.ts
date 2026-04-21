import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      status: "up",
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
