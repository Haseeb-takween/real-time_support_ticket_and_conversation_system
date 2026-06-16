const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

export async function proxyToBackend(path: string, req: Request): Promise<Response> {
  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  const cookie = req.headers.get("cookie");
  if (cookie) {
    headers.set("cookie", cookie);
  }

  const backendRes = await fetch(`${BACKEND_URL}/api${path}`, {
    method: req.method,
    headers,
    body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined,
  });

  const resHeaders = new Headers();
  const resContentType = backendRes.headers.get("content-type");
  if (resContentType) {
    resHeaders.set("content-type", resContentType);
  }

  const setCookie = backendRes.headers.get("set-cookie");
  if (setCookie) {
    resHeaders.set("set-cookie", setCookie);
  }

  return new Response(backendRes.body, {
    status: backendRes.status,
    headers: resHeaders,
  });
}
