export async function POST(req) {
  const body = await req.json();

  const response = await fetch(
    process.env.BACKEND_URL + "/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    }
  );

  const data = await response.json();

  // Forward ALL Set-Cookie headers
  const headers = new Headers();
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      headers.append("Set-Cookie", value);
    }
  });

  headers.set("Content-Type", "application/json");

  return new Response(JSON.stringify(data), {
    status: response.status,
    headers,
  });
}
