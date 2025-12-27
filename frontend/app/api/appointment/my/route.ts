import { NextResponse } from "next/server";
const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const url = status
      ? `${BACKEND_URL}/appointment/my?status=${encodeURIComponent(status)}`
      : `${BACKEND_URL}/appointment/my`;

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json", cookie },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Gagal mengambil appointment" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("API /api/appointment/my error:", e);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
