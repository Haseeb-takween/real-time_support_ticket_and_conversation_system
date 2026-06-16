import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(req: Request) {
  return proxyToBackend("/auth/me", req);
}
