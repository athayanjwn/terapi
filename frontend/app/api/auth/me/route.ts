import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";

  const response = await fetch(
    `${process.env.BACKEND_URL}/auth/me`,
    {
      method: "GET",
      headers: {
        cookie,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return new Response("Unauthorized", { status: 401 });
  }

  const data = await response.json();

  console.log(data);
  return Response.json(data);
}

export async function PUT(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const body = await req.json().catch(() => ({}));

  const res = await fetch(`${process.env.BACKEND_URL}/profile/me`, {
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
}