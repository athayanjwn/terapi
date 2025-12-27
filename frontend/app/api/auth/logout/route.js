export async function POST(req) {
  const cookie = req.headers.get("cookie") || "";

  const response = await fetch(
    process.env.BACKEND_URL + "/auth/logout",
    {
      method: "POST",
      headers: {
        cookie,
      },
      credentials: "include",
    }
  );

  const data = await response.json();

  // Forward cookie clearing headers
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
