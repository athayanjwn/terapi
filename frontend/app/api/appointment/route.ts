import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

function backendUrl(path: string) {
  if (!BACKEND_URL) throw new Error("BACKEND_URL belum diset di .env.local");
  return `${BACKEND_URL}${path}`;
}

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const { searchParams } = new URL(req.url);

    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";

    const res = await fetch(backendUrl(`/appointment?page=${page}&limit=${limit}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        cookie,
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Gagal mengambil data konselor" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API /api/appointment GET error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const body = await req.json();

    const res = await fetch(backendUrl("/appointment"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Gagal membuat appointment" },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("API /api/appointment POST error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
