"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

type OptionInput = {
  order_no: number;
  label: string;
  value: number;
};

type QuestionInput = {
  order_no: number;
  question: string;
  dimension: string;
  reverse_scored: boolean;
  options: OptionInput[];
};

function normalizeQuestions(raw: any[]): QuestionInput[] {
  const qs = Array.isArray(raw) ? raw : [];
  return qs
    .slice()
    .sort((a, b) => (a?.order_no ?? 0) - (b?.order_no ?? 0))
    .map((q: any, idx: number) => ({
      order_no: Number(q?.order_no ?? idx + 1),
      question: String(q?.question ?? ""),
      dimension: String(q?.dimension ?? ""),
      reverse_scored: !!q?.reverse_scored,
      options: (Array.isArray(q?.options) ? q.options : [])
        .slice()
        .sort((a: any, b: any) => (a?.order_no ?? 0) - (b?.order_no ?? 0))
        .map((o: any, j: number) => ({
          order_no: Number(o?.order_no ?? j + 1),
          label: String(o?.label ?? ""),
          value: Number(o?.value ?? j),
        })),
    }));
}

function renumber<T extends { order_no: number }>(arr: T[]): T[] {
  return arr.map((x, i) => ({ ...x, order_no: i + 1 }));
}

function Icon({ name }: { name: "up" | "down" | "trash" | "plus" | "save" | "refresh" }) {
  // simple inline icons (no extra libs)
  if (name === "up")
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 5l-7 7m7-7 7 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M12 5v14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      </svg>
    );
  if (name === "down")
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 19l7-7m-7 7-7-7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M12 5v14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      </svg>
    );
  if (name === "trash")
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 7h16" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M10 11v7M14 11v7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M6 7l1 14h10l1-14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M9 7V5h6v2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      </svg>
    );
  if (name === "plus")
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      </svg>
    );
  if (name === "save")
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 20h14a1 1 0 0 0 1-1V8l-3-3H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M8 20v-7h8v7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M8 5v3h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 12a8 8 0 1 1-2.34-5.66"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path d="M20 4v6h-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CMSQuestionsPage() {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [questions, setQuestions] = useState<QuestionInput[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const stats = useMemo(() => {
    const qCount = questions.length;
    const optCount = questions.reduce((acc, q) => acc + (q.options?.length ?? 0), 0);
    const dimSet = new Set<string>();
    questions.forEach((q) => q.dimension && dimSet.add(q.dimension));
    return { qCount, optCount, dims: Array.from(dimSet).sort() };
  }, [questions]);

  async function load() {
    if (!id) return;
    try {
      setErr(null);
      setOk(null);
      setLoading(true);

      const detail = await apiFetch<any>(`/api/self-assessments-cms/${id}/detail`);
      setQuestions(normalizeQuestions(detail?.questions));
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function validate(): string | null {
    if (questions.length === 0) return "Minimal harus ada 1 pertanyaan.";
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question?.trim()) return `Pertanyaan #${i + 1}: teks pertanyaan wajib diisi.`;
      if (!q.dimension?.trim()) return `Pertanyaan #${i + 1}: dimension wajib diisi.`;
      if (!Array.isArray(q.options) || q.options.length === 0) return `Pertanyaan #${i + 1}: minimal 1 option.`;
      for (let j = 0; j < q.options.length; j++) {
        const o = q.options[j];
        if (!o.label?.trim()) return `Pertanyaan #${i + 1}, option #${j + 1}: label wajib diisi.`;
        if (Number.isNaN(Number(o.value))) return `Pertanyaan #${i + 1}, option #${j + 1}: value harus angka.`;
      }
    }
    return null;
  }

  async function save() {
    if (!id) return;
    try {
      setErr(null);
      setOk(null);

      const v = validate();
      if (v) throw new Error(v);

      setSaving(true);

      const payloadQuestions = renumber(
        questions.map((q) => ({
          ...q,
          options: renumber(q.options),
        }))
      );

      await apiFetch(`/api/self-assessments-cms/${id}/questions`, {
        method: "PUT",
        body: JSON.stringify({ questions: payloadQuestions }),
      });

      setOk("Questions berhasil disimpan.");
      await load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  function addQuestion() {
    setQuestions((prev) =>
      prev.concat({
        order_no: prev.length + 1,
        question: "",
        dimension: "",
        reverse_scored: false,
        options: [
          { order_no: 1, label: "Tidak pernah", value: 0 },
          { order_no: 2, label: "Jarang", value: 1 },
          { order_no: 3, label: "Kadang-kadang", value: 2 },
          { order_no: 4, label: "Sering", value: 3 },
          { order_no: 5, label: "Sangat sering", value: 4 },
        ],
      })
    );
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => renumber(prev.filter((_, i) => i !== index)));
  }

  function moveQuestion(index: number, dir: -1 | 1) {
    setQuestions((prev) => {
      const next = prev.slice();
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return renumber(next);
    });
  }

  function updateQuestion(index: number, patch: Partial<QuestionInput>) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }

  function addOption(qIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const nextOpts = q.options.concat({
          order_no: q.options.length + 1,
          label: "",
          value: q.options.length,
        });
        return { ...q, options: renumber(nextOpts) };
      })
    );
  }

  function removeOption(qIndex: number, optIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        return { ...q, options: renumber(q.options.filter((_, j) => j !== optIndex)) };
      })
    );
  }

  function moveOption(qIndex: number, optIndex: number, dir: -1 | 1) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const next = q.options.slice();
        const j = optIndex + dir;
        if (j < 0 || j >= next.length) return q;
        [next[optIndex], next[j]] = [next[j], next[optIndex]];
        return { ...q, options: renumber(next) };
      })
    );
  }

  function updateOption(qIndex: number, optIndex: number, patch: Partial<OptionInput>) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const nextOpts = q.options.map((o, j) => (j === optIndex ? { ...o, ...patch } : o));
        return { ...q, options: nextOpts };
      })
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <Link className="text-sm font-medium text-slate-600 hover:text-slate-900" href="/konselor/assessments">
                ← Kembali
              </Link>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-slate-900">Edit Questions</h1>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                  ID: <span className="font-mono">{id}</span>
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Kelola pertanyaan & opsi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                <span>
                  Q: <b>{stats.qCount}</b>
                </span>
                <span className="text-slate-300">•</span>
                <span>
                  Opt: <b>{stats.optCount}</b>
                </span>
              </div>

              <button
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                onClick={load}
                disabled={loading || saving}
              >
                <Icon name="refresh" />
                Reload
              </button>

              <button
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                onClick={addQuestion}
                disabled={loading || saving}
              >
                <Icon name="plus" />
                Add Question
              </button>

              <button
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
                onClick={save}
                disabled={loading || saving}
              >
                <Icon name="save" />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {stats.dims.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {stats.dims.map((d) => (
                <span key={d} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                  {d}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {(err || ok) && (
          <div className="space-y-2">
            {err && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {err}
              </div>
            )}
            {ok && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                {ok}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
            Loading...
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {questions.map((q, qi) => (
              <div key={qi} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                {/* Question header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900">
                      {q.order_no}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">Question</div>
                      <div className="text-xs text-slate-600">
                        Options: <b>{q.options?.length ?? 0}</b>
                        {q.reverse_scored ? (
                          <span className="ml-2 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                            Reverse
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <button
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      onClick={() => moveQuestion(qi, -1)}
                      disabled={qi === 0 || saving}
                      title="Move up"
                    >
                      <Icon name="up" />
                      Up
                    </button>
                    <button
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      onClick={() => moveQuestion(qi, 1)}
                      disabled={qi === questions.length - 1 || saving}
                      title="Move down"
                    >
                      <Icon name="down" />
                      Down
                    </button>
                    <button
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                      onClick={() => removeQuestion(qi)}
                      disabled={saving}
                      title="Delete question"
                    >
                      <Icon name="trash" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Question fields */}
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-slate-600">Question text</label>
                    <input
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                      value={q.question}
                      onChange={(e) => updateQuestion(qi, { question: e.target.value })}
                      placeholder="Tulis pertanyaan..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">Dimension</label>
                    <input
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                      value={q.dimension}
                      onChange={(e) => updateQuestion(qi, { dimension: e.target.value })}
                      placeholder="contoh: burnout"
                    />

                    <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={q.reverse_scored}
                        onChange={(e) => updateQuestion(qi, { reverse_scored: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-200"
                      />
                      Reverse scored
                    </label>
                  </div>
                </div>

                {/* Options */}
                <div className="mt-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-slate-900">Options</div>
                    <button
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                      onClick={() => addOption(qi)}
                      disabled={saving}
                    >
                      <Icon name="plus" />
                      Add option
                    </button>
                  </div>

                  <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-3 py-2 text-left w-14">#</th>
                          <th className="px-3 py-2 text-left">Label</th>
                          <th className="px-3 py-2 text-left w-32">Value</th>
                          <th className="px-3 py-2 text-right w-48">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {q.options.map((o, oi) => (
                          <tr key={oi} className="border-t border-slate-100">
                            <td className="px-3 py-2 text-slate-700">{o.order_no}</td>
                            <td className="px-3 py-2">
                              <input
                                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                                value={o.label}
                                onChange={(e) => updateOption(qi, oi, { label: e.target.value })}
                                placeholder="contoh: Tidak pernah"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                className="h-10 w-28 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                                value={o.value}
                                onChange={(e) =>
                                  updateOption(qi, oi, { value: Number(e.target.value) })
                                }
                              />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <div className="inline-flex gap-2">
                                <button
                                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                  onClick={() => moveOption(qi, oi, -1)}
                                  disabled={oi === 0 || saving}
                                  title="Move up"
                                >
                                  <Icon name="up" />
                                </button>
                                <button
                                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                  onClick={() => moveOption(qi, oi, 1)}
                                  disabled={oi === q.options.length - 1 || saving}
                                  title="Move down"
                                >
                                  <Icon name="down" />
                                </button>
                                <button
                                  className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100 disabled:opacity-50"
                                  onClick={() => removeOption(qi, oi)}
                                  disabled={saving}
                                  title="Delete option"
                                >
                                  <Icon name="trash" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {q.options.length === 0 && (
                          <tr className="border-t border-slate-100">
                            <td className="px-3 py-4 text-slate-500" colSpan={4}>
                              Belum ada option. Klik <b>Add option</b>.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-2 text-xs text-slate-500">
                    Tips: urutan option bisa diubah pakai tombol ↑ ↓. Value sebaiknya konsisten (mis. 0–4).
                  </div>
                </div>
              </div>
            ))}

            {questions.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
                Belum ada pertanyaan. Klik <b>Add Question</b>.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
