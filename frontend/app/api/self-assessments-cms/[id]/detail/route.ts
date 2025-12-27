import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const BACKEND = process.env.BACKEND_URL;

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const cookie = req.headers.get("cookie") || "";

  const res = await fetch(`${BACKEND}/self-assessments/admin/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", cookie },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
