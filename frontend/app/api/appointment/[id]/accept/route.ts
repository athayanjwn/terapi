import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ UNWRAP params
    const { id } = await context.params;

    const cookie = req.headers.get("cookie") || "";

    const res = await fetch(`${BACKEND_URL}/appointment/${id}/accept`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        cookie,
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Gagal accept appointment" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("API accept error:", e);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
