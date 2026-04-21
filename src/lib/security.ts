import { NextResponse } from "next/server";
import { consumeRateLimit } from "@/lib/rate-limit";

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const [first] = forwarded.split(",");
    return first.trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp.trim();
  }

  return "unknown";
}

export function enforceSameOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return null;
  }

  const requestUrl = new URL(request.url);
  if (origin !== requestUrl.origin) {
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  }

  return null;
}

export function enforceRateLimit(
  request: Request,
  keyPrefix: string,
  limit: number,
  windowMs: number,
) {
  const ip = getClientIp(request);
  const result = consumeRateLimit(`${keyPrefix}:${ip}`, limit, windowMs);

  if (result.allowed) {
    return null;
  }

  return NextResponse.json(
    { error: "Demasiadas solicitudes. Inténtalo de nuevo en unos minutos." },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSeconds),
      },
    },
  );
}
