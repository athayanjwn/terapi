import { redirect } from "next/navigation";
import { headers } from "next/headers";
import AssessmentCard from "@/components/self-assessment/AssessmentCard";
import { SAAssessmentListItem } from "@/lib/types/selfAssessment";

async function getOrigin() {
  const h = await headers();
  const host = h.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  return `${protocol}://${host}`;
}

async function getMe() {
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

export default async function Page() {
  const origin = await getOrigin();

  const me = await getMe();
  if (me?.profile?.role === "CONTENT_MANAGER_KONSELOR") {
    redirect("/konselor/assessments");
  }

  let items: SAAssessmentListItem[] = [];
  let errorMsg = "";

  try {
    const res = await fetch(`${origin}/api/self-assessments`, { cache: "no-store" });
    if (!res.ok) {
      errorMsg = "Gagal memuat daftar assessment. Coba refresh halaman.";
    } else {
      const json = await res.json();
      items = Array.isArray(json) ? (json as SAAssessmentListItem[]) : [];
    }
  } catch {
    errorMsg = "Terjadi kendala koneksi. Coba lagi beberapa saat.";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  Self-Assessment Kesehatan Mental
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
                  Ini bukan diagnosis. Jika kamu merasa dalam kondisi darurat, segera hubungi layanan bantuan profesional setempat
                  atau orang terdekat yang bisa membantu.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                Pilih assessment • Jawab jujur • Dapatkan ringkasan hasil
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                Privasi: hasil tidak disimpan
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8">
          {errorMsg ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
              <div className="font-semibold">Oops…</div>
              <div className="mt-1">{errorMsg}</div>
            </div>
          ) : !items.length ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-50 text-slate-700">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 15V6a2 2 0 0 0-2-2H8"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M17 21H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="mt-3 text-base font-semibold text-slate-900">Belum ada assessment</div>
              <div className="mt-1 text-sm text-slate-600">
                Nanti kalau sudah tersedia, daftar assessment akan muncul di sini.
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((a) => (
                <AssessmentCard key={a.id} a={a} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
