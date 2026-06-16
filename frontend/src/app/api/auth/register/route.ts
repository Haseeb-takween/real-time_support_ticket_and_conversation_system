import { proxyToBackend } from "@/lib/backend-proxy";

export async function POST(req: Request) {
  return proxyToBackend("/auth/register", req);
}
