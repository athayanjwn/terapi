import Link from "next/link";
import type { SAAssessmentListItem } from "@/lib/types/selfAssessment";

export default function AssessmentCard({ a }: { a: SAAssessmentListItem }) {
  return (
    <Link
      href={`/self-assessment/${a.slug}`}
      className={[
        "group block h-full rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm",
        "transition will-change-transform hover:-translate-y-0.5 hover:shadow-md",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/70 focus-visible:ring-offset-2",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold leading-snug text-slate-900 group-hover:text-slate-950">
          {a.title}
        </h2>

        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition group-hover:bg-slate-100">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-80">
            <path
              d="M7 17L17 7"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M9 7h8v8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
        {a.description}
      </p>

      {!!(a.tags || []).length && (
        <div className="mt-4 flex flex-wrap gap-2">
          {(a.tags || []).slice(0, 6).map((t) => (
            <span
              key={t}
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900 group-hover:underline">
          Mulai assessment
        </span>
      </div>
    </Link>
  );
}
