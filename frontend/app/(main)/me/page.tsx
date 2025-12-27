import { headers } from "next/headers";
import { redirect } from "next/navigation";
import MeEditClient from "./MeEditClient";

type MeResponse = {
  user: { email: string };
  profile: any; // nanti ditangani client berdasarkan type
};

async function getOrigin() {
  const h = await headers();
  const host = h.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  return `${protocol}://${host}`;
}

async function getMe(): Promise<MeResponse | null> {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const origin = await getOrigin();

  const res = await fetch(`${origin}/api/auth/me`, {
    headers: cookie ? { cookie } : {},
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function MePage() {
  const me = await getMe();
  if (!me) redirect("/login");

  return <MeEditClient me={me} />;
}
