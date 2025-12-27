import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const revalidate = 0;
const BACKEND = process.env.BACKEND_URL;

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const cookie = req.headers.get("cookie") || "";
  const body = await req.json();
  const res = await fetch(`${BACKEND}/self-assessments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const cookie = req.headers.get("cookie") || "";
  const res = await fetch(`${BACKEND}/self-assessments/${id}`, {
    method: "DELETE",
    headers: { cookie },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
