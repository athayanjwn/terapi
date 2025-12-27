import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const revalidate = 0;
const BACKEND = process.env.BACKEND_URL;

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const res = await fetch(`${BACKEND}/self-assessments/me/history`, {
    headers: { cookie, "Content-Type": "application/json" },
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
