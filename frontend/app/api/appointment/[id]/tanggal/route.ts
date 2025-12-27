import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ unwrap params

    const cookie = req.headers.get("cookie") || "";
    const { searchParams } = new URL(req.url);
    const tanggal = searchParams.get("tanggal") || "";

    const res = await fetch(
      `${BACKEND_URL}/appointment/konselor/${id}/tanggal?tanggal=${encodeURIComponent(tanggal)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", cookie },
        cache: "no-store",
      }
    );

    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json")
      ? await res.json()
      : { message: await res.text() };

    if (!res.ok) {
      return NextResponse.json(
        { message: (data as any)?.message || "Gagal mengambil booked slot" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("API booked slot error:", e);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
