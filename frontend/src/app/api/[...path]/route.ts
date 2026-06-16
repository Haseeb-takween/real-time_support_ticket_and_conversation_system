import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

async function handler(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxyToBackend(`/${path.join("/")}`, req);
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
