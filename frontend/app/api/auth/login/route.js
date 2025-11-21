export async function POST(req){
    const body = await req.json();

    const response = await fetch(process.env.BACKEND_URL + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json "},
        body: JSON.stringify(body),
        credentials: "include",
    })

    const cookie = response.headers.get("Set-Cookie");

    const data = await response.json();

    return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
            "Content-Type": "application/json",
            "Set-Cookie": cookie || "",
        }
    });
};