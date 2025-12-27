import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BACKEND = process.env.BACKEND_URL;

export async function GET(req: Request) {
  const res = await fetch(`${BACKEND}/self-assessments`, { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const body = await req.json();

  const res = await fetch(`${BACKEND}/self-assessments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
