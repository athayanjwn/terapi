"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { SAAssessmentDetail, SubmitAnswer, SubmitResponse } from "@/lib/types/selfAssessment";
import QuestionBlock from "@/components/self-assessment/QuestionBlock";
import ResultPanel from "@/components/self-assessment/ResultPanel";
import Link from "next/link";

export default function SelfAssessmentDetailClient({ slug }: { slug: string }) {
  const [a, setA] = useState<SAAssessmentDetail | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResponse | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const data = await apiFetch<SAAssessmentDetail>(`/api/self-assessments/${slug}`);
        setA(data);
      } catch (e: any) {
        setErr(e.message);
        setA(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const totalQ = a?.questions?.length || 0;
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  function setAnswer(questionId: string, optionId: string) {
    setAnswers((p) => ({ ...p, [questionId]: optionId }));
  }

  async function submit() {
    try {
      if (!a) return;
      setErr(null);
      setResult(null);

      if (answeredCount < totalQ) {
        throw new Error(`Jawaban belum lengkap (${answeredCount}/${totalQ})`);
      }

      const payload: { answers: SubmitAnswer[] } = {
        answers: Object.entries(answers).map(([question_id, option_id]) => ({
          question_id,
          option_id,
        })),
      };

      setSubmitting(true);
      const r = await apiFetch<SubmitResponse>(`/api/self-assessments/${slug}/submit`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setResult(r);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <Link className="text-sm underline" href="/self-assessment">
          ← Kembali
        </Link>
        <div className="text-sm text-gray-600">
          {answeredCount}/{totalQ} terjawab
        </div>
      </div>

      {loading && <div className="mt-6">Loading...</div>}
      {err && <div className="mt-6 text-red-600">{err}</div>}

      {a && (
        <>
          <h1 className="text-2xl font-bold mt-4">{a.title}</h1>
          <p className="text-sm text-gray-600 mt-2">{a.description}</p>

          {result && <ResultPanel data={result} />}

          <div className="grid gap-3 mt-6">
            {a.questions.map((q) => (
              <QuestionBlock
                key={q.id}
                q={q}
                selectedOptionId={answers[q.id]}
                onChange={(optId) => setAnswer(q.id, optId)}
              />
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              className="px-4 py-2 rounded-lg border disabled:opacity-50"
              onClick={() => setAnswers({})}
              disabled={submitting}
            >
              Reset
            </button>
            <button
              className="px-4 py-2 rounded-lg border bg-black text-white disabled:opacity-50"
              onClick={submit}
              disabled={submitting || !totalQ}
            >
              {submitting ? "Memproses..." : "Lihat Hasil"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
