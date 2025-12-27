import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const backend = process.env.BACKEND_URL; // contoh: http://localhost:5000
    if (!backend) {
      return NextResponse.json({ message: "BACKEND_URL not set" }, { status: 500 });
    }

    // Forward cookies ke backend (penting buat requireAuth)
    const cookie = req.headers.get("cookie") ?? "";

    const res = await fetch(`${backend}/self-assessments/admin/list`, {
      method: "GET",
      headers: cookie ? { cookie } : {},
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}
