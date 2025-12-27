import { SAQuestion } from "@/lib/types/selfAssessment";

export default function QuestionBlock({
  q,
  selectedOptionId,
  onChange,
}: {
  q: SAQuestion;
  selectedOptionId?: string;
  onChange: (optionId: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">
          {q.order_no}
        </div>
        <div className="font-semibold leading-relaxed text-slate-900">{q.question}</div>
      </div>

      <div className="mt-4 grid gap-2">
        {q.options.map((o) => {
          const checked = selectedOptionId === o.id;
          return (
            <label
              key={o.id}
              className={[
                "group flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-4 transition",
                checked
                  ? "border-slate-300 bg-slate-50"
                  : "border-slate-200 bg-white hover:bg-slate-50/60",
              ].join(" ")}
            >
              <div className="flex items-center gap-3">
                <span
                  className={[
                    "grid h-5 w-5 place-items-center rounded-full border transition",
                    checked ? "border-slate-900 bg-slate-900" : "border-slate-300 bg-white",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  <span className={checked ? "h-2 w-2 rounded-full bg-white" : "hidden"} />
                </span>

                <span className="text-sm font-medium text-slate-900">{o.label}</span>
              </div>

              <input
                type="radio"
                name={`q_${q.id}`}
                className="sr-only"
                checked={checked}
                onChange={() => onChange(o.id)}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
