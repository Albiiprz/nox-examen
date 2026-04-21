export function getOrCreateRequestId(request: Request) {
  const existing = request.headers.get("x-request-id")?.trim();
  if (existing) {
    return existing.slice(0, 120);
  }

  return crypto.randomUUID();
}
