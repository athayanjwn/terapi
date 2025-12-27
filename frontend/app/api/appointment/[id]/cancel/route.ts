import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ unwrap params
    const cookie = req.headers.get("cookie") || "";

    const res = await fetch(`${BACKEND_URL}/appointment/${id}/cancel`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", cookie },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Gagal cancel appointment" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("API cancel error:", e);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
