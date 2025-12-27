import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; 

    const res = await fetch(
      `${process.env.BACKEND_URL}/articles/${id}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { message: "Artikel tidak ditemukan" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API article detail error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const body = await req.json().catch(() => ({}));
    const { id } = await context.params;

    const res = await fetch(`${process.env.BACKEND_URL}/articles/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("API update article error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

/**
 * COUNSELOR: DELETE (cookie-based auth)
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const { id } = await context.params;

    const res = await fetch(`${process.env.BACKEND_URL}/articles/${id}`, {
      method: "DELETE",
      headers: {
        ...(cookie ? { cookie } : {}),
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Gagal menghapus artikel" },
        { status: res.status }
      );
    }

    return NextResponse.json({ message: "Artikel berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("API delete article error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
