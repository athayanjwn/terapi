import Link from "next/link";
import Image from "next/image";
import { KonselorReco } from "@/lib/types/selfAssessment";

function normalizeImageSrc(src?: string | null): string | null {
  if (!src) return null;

  const s = String(src).trim();
  if (!s || s === "null" || s === "undefined") return null;

  // protocol-relative URL: //example.com/a.jpg
  if (s.startsWith("//")) return `https:${s}`;

  // absolute http(s)
  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  // allow absolute path from your app: /images/a.png
  if (s.startsWith("/")) return s;

  // other formats (e.g. "avatars/1.png") -> reject to avoid Invalid URL
  return null;
}

export default function KonselorRecoList({ items }: { items: KonselorReco[] }) {
  if (!items?.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
        Belum ada rekomendasi konselor untuk hasil ini.
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((k) => {
        const src = normalizeImageSrc(k.foto_profil);

        return (
          <div
            key={k.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                {src ? (
                  <Image
                    src={src}
                    alt={k.nama_konselor}
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-slate-600">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 21a8 8 0 1 0-16 0"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-base font-semibold text-slate-900">
                  {k.nama_konselor}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {(k.spesialisasi || []).length
                    ? (k.spesialisasi || []).join(" • ")
                    : "Spesialisasi belum tersedia"}
                </div>
              </div>
            </div>

            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-700">
              {k.deskripsi || "Belum ada deskripsi."}
            </p>

            <div className="mt-4">
              <Link
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/70 focus-visible:ring-offset-2"
                href={`/appointment/${k.id}`}
              >
                Lihat detail & booking
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="opacity-80">
                  <path d="M7 17L17 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M9 7h8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
