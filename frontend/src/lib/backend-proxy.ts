function getBackendUrl(): string {
  const url =
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : undefined);

  if (!url) {
    throw new Error(
      "BACKEND_URL is not configured. Set it on Render to your backend URL, e.g. https://real-time-support-ticket-and.onrender.com",
    );
  }

  return url.replace(/\/$/, "");
}

export async function proxyToBackend(path: string, req: Request): Promise<Response> {
  let backendUrl: string;

  try {
    backendUrl = getBackendUrl();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Backend URL is not configured";
    return Response.json({ status: "error", message }, { status: 503 });
  }

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  const cookie = req.headers.get("cookie");
  if (cookie) {
    headers.set("cookie", cookie);
  }

  let backendRes: Response;

  try {
    backendRes = await fetch(`${backendUrl}/api${path}`, {
      method: req.method,
      headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to reach backend";
    return Response.json(
      { status: "error", message: `Backend unreachable at ${backendUrl}: ${message}` },
      { status: 502 },
    );
  }

  const resHeaders = new Headers();
  const resContentType = backendRes.headers.get("content-type");
  if (resContentType) {
    resHeaders.set("content-type", resContentType);
  }

  const setCookies =
    typeof backendRes.headers.getSetCookie === "function"
      ? backendRes.headers.getSetCookie()
      : backendRes.headers.get("set-cookie")
        ? [backendRes.headers.get("set-cookie")!]
        : [];

  for (const setCookie of setCookies) {
    resHeaders.append("set-cookie", setCookie);
  }

  return new Response(backendRes.body, {
    status: backendRes.status,
    headers: resHeaders,
  });
}
