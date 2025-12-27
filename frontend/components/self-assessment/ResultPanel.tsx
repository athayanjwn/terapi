import { SubmitResponse } from "@/lib/types/selfAssessment";
import KonselorRecoList from "./KonselorRecoList";

function levelBadgeClass(level?: string) {
  const l = (level || "").toLowerCase();
  if (l.includes("tinggi") || l.includes("berat") || l.includes("severe")) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  if (l.includes("sedang") || l.includes("moderate")) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }
  if (l.includes("rendah") || l.includes("mild") || l.includes("low")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  return "border-slate-200 bg-slate-50 text-slate-700";
}

export default function ResultPanel({ data }: { data: SubmitResponse }) {
  const entries = Object.entries(data.result || {});

  return (
    <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-semibold tracking-tight text-slate-900">Hasil</div>
          <div className="mt-1 text-sm text-slate-600">
            Ini ringkasan berdasarkan jawaban kamu. Jika kamu merasa kesulitan, pertimbangkan untuk konsultasi.
          </div>
        </div>

        <div className="hidden sm:block">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 7l-8 10-4-4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {!entries.length ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
            Tidak ada hasil untuk ditampilkan.
          </div>
        ) : (
          entries.map(([dim, r]) => (
            <div key={dim} className="rounded-2xl border border-slate-200 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-base font-semibold text-slate-900">{dim}</div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                    Skor: {r.score}
                  </span>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${levelBadgeClass(r.level)}`}>
                    Level: {r.level}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">{r.summary}</p>
            </div>
          ))
        )}
      </div>

      <div className="mt-7">
        <div className="mb-2 text-base font-semibold text-slate-900">Rekomendasi Konselor</div>
        <KonselorRecoList items={data.recommended_konselor || []} />
      </div>
    </div>
  );
}
