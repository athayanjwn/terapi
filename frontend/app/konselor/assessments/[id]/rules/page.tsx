"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

type RuleInput = {
  dimension: string;
  min_score: number;
  max_score: number;
  level: string;
  summary: string;
  recommend_tags: string[];
};

function normalizeRules(raw: any[]): RuleInput[] {
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((r) => ({
    dimension: String(r?.dimension ?? ""),
    min_score: Number(r?.min_score ?? 0),
    max_score: Number(r?.max_score ?? 0),
    level: String(r?.level ?? ""),
    summary: String(r?.summary ?? ""),
    recommend_tags: Array.isArray(r?.recommend_tags)
      ? r.recommend_tags.map((t: any) => String(t).trim()).filter(Boolean)
      : [],
  }));
}

export default function CMSRulesPage() {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [rules, setRules] = useState<RuleInput[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const stats = useMemo(() => {
    const dims = Array.from(new Set(rules.map((r) => r.dimension).filter(Boolean))).sort();
    return { rCount: rules.length, dims };
  }, [rules]);

  async function load() {
    if (!id) return;

    try {
      setErr(null);
      setOk(null);
      setLoading(true);

      const detail = await apiFetch<any>(`/api/self-assessments-cms/${id}/detail`);
      setRules(normalizeRules(detail?.rules));
    } catch (e: any) {
      setErr(e.message);
      setRules([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function updateRule(index: number, patch: Partial<RuleInput>) {
    setRules((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function removeRule(index: number) {
    setRules((prev) => prev.filter((_, i) => i !== index));
  }

  function addRule() {
    setRules((prev) =>
      prev.concat({
        dimension: prev[0]?.dimension ?? "",
        min_score: 0,
        max_score: 0,
        level: "",
        summary: "",
        recommend_tags: [],
      })
    );
  }

  function moveRule(index: number, dir: -1 | 1) {
    setRules((prev) => {
      const next = prev.slice();
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  function validate(): string | null {
    if (rules.length === 0) return "Minimal harus ada 1 rule.";

    for (let i = 0; i < rules.length; i++) {
      const r = rules[i];
      if (!r.dimension?.trim()) return `Rule #${i + 1}: dimension wajib diisi.`;
      if (Number.isNaN(Number(r.min_score))) return `Rule #${i + 1}: min_score harus angka.`;
      if (Number.isNaN(Number(r.max_score))) return `Rule #${i + 1}: max_score harus angka.`;
      if (r.min_score > r.max_score) return `Rule #${i + 1}: min_score tidak boleh > max_score.`;
      if (!r.level?.trim()) return `Rule #${i + 1}: level wajib diisi.`;
      if (!r.summary?.trim()) return `Rule #${i + 1}: summary wajib diisi.`;
      if (!Array.isArray(r.recommend_tags)) return `Rule #${i + 1}: recommend_tags harus array.`;
    }

    // Optional: cek overlap per dimension (sering jadi bug hasil)
    // Tidak memaksa, tapi bagus untuk quality:
    const byDim = new Map<string, RuleInput[]>();
    rules.forEach((r) => {
      const key = r.dimension.trim();
      if (!key) return;
      byDim.set(key, (byDim.get(key) || []).concat(r));
    });

    for (const [dim, list] of byDim.entries()) {
      const sorted = list.slice().sort((a, b) => a.min_score - b.min_score);
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const cur = sorted[i];
        // overlap jika cur.min_score <= prev.max_score
        if (cur.min_score <= prev.max_score) {
          return `Dimension "${dim}" punya rentang yang overlap: [${prev.min_score}-${prev.max_score}] dan [${cur.min_score}-${cur.max_score}].`;
        }
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

      // clean tags
      const payloadRules = rules.map((r) => ({
        ...r,
        min_score: Number(r.min_score),
        max_score: Number(r.max_score),
        recommend_tags: (r.recommend_tags || []).map((t) => String(t).trim()).filter(Boolean),
      }));

      await apiFetch(`/api/self-assessments-cms/${id}/rules`, {
        method: "PUT",
        body: JSON.stringify({ rules: payloadRules }),
      });

      setOk("Rules berhasil disimpan.");
      await load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  function addTag(ruleIndex: number, tag: string) {
    const t = tag.trim();
    if (!t) return;
    setRules((prev) =>
      prev.map((r, i) => {
        if (i !== ruleIndex) return r;
        const set = new Set((r.recommend_tags || []).map((x) => x.trim()).filter(Boolean));
        set.add(t);
        return { ...r, recommend_tags: Array.from(set) };
      })
    );
  }

  function removeTag(ruleIndex: number, tag: string) {
    setRules((prev) =>
      prev.map((r, i) => {
        if (i !== ruleIndex) return r;
        return { ...r, recommend_tags: (r.recommend_tags || []).filter((t) => t !== tag) };
      })
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link className="text-sm text-gray-600 underline" href="/konselor/assessments">
              ← Back
            </Link>
            <h1 className="mt-3 text-2xl font-semibold text-gray-900">Edit Rules</h1>
            <p className="mt-1 text-sm text-gray-600">
              Rule menentukan level hasil + recommend tags untuk rekomendasi.
            </p>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-700">
              Rules: <b>{stats.rCount}</b>
            </div>
            {stats.dims.length > 0 && <div className="text-xs text-gray-500">Dimensions: {stats.dims.join(", ")}</div>}
          </div>
        </div>

        {(err || ok) && (
          <div className="mt-4 space-y-2">
            {err && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{err}</div>}
            {ok && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{ok}</div>}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            className="rounded-xl border bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            onClick={load}
            disabled={loading || saving}
          >
            Reload
          </button>

          <button
            className="rounded-xl border bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            onClick={addRule}
            disabled={loading || saving}
          >
            + Add Rule
          </button>

          <button
            className="rounded-xl bg-black px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            onClick={save}
            disabled={loading || saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 text-gray-600">Loading...</div>
        ) : (
          <div className="mt-6 space-y-4">
            {rules.map((r, idx) => (
              <RuleCard
                key={idx}
                index={idx}
                total={rules.length}
                rule={r}
                saving={saving}
                onMove={(dir) => moveRule(idx, dir)}
                onDelete={() => removeRule(idx)}
                onChange={(patch) => updateRule(idx, patch)}
                onAddTag={(tag) => addTag(idx, tag)}
                onRemoveTag={(tag) => removeTag(idx, tag)}
              />
            ))}

            {rules.length === 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-600">
                Belum ada rules. Klik <b>Add Rule</b>.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RuleCard({
  index,
  total,
  rule,
  saving,
  onMove,
  onDelete,
  onChange,
  onAddTag,
  onRemoveTag,
}: {
  index: number;
  total: number;
  rule: RuleInput;
  saving: boolean;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
  onChange: (patch: Partial<RuleInput>) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}) {
  const [tagInput, setTagInput] = useState("");

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold">
            {index + 1}
          </span>
          <div className="text-sm text-gray-600">Rule</div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
            onClick={() => onMove(-1)}
            disabled={index === 0 || saving}
          >
            ↑
          </button>
          <button
            className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
            onClick={() => onMove(1)}
            disabled={index === total - 1 || saving}
          >
            ↓
          </button>
          <button
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700 disabled:opacity-50"
            onClick={onDelete}
            disabled={saving}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div>
          <label className="text-xs font-medium text-gray-600">Dimension</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-gray-400"
            value={rule.dimension}
            onChange={(e) => onChange({ dimension: e.target.value })}
            placeholder="contoh: burnout"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600">Min score</label>
          <input
            type="number"
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-gray-400"
            value={rule.min_score}
            onChange={(e) => onChange({ min_score: Number(e.target.value) })}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600">Max score</label>
          <input
            type="number"
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-gray-400"
            value={rule.max_score}
            onChange={(e) => onChange({ max_score: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div>
          <label className="text-xs font-medium text-gray-600">Level</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-gray-400"
            value={rule.level}
            onChange={(e) => onChange({ level: e.target.value })}
            placeholder="contoh: rendah"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs font-medium text-gray-600">Summary</label>
          <textarea
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-gray-400"
            rows={2}
            value={rule.summary}
            onChange={(e) => onChange({ summary: e.target.value })}
            placeholder="Ringkasan untuk user..."
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-sm font-semibold text-gray-900">Recommend tags</div>

        <div className="mt-2 flex flex-wrap gap-2">
          {rule.recommend_tags?.length ? (
            rule.recommend_tags.map((t) => (
              <button
                key={t}
                type="button"
                className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm hover:bg-gray-50"
                onClick={() => onRemoveTag(t)}
                title="Klik untuk hapus"
              >
                <span>{t}</span>
                <span className="text-gray-400">×</span>
              </button>
            ))
          ) : (
            <div className="text-sm text-gray-600">Belum ada tags.</div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <input
            className="w-72 max-w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-gray-400"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Tambah tag (contoh: kecemasan)"
          />
          <button
            className="rounded-xl border bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            type="button"
            onClick={() => {
              onAddTag(tagInput);
              setTagInput("");
            }}
            disabled={!tagInput.trim()}
          >
            Add tag
          </button>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          Tips: tag dipakai untuk rekomendasi konselor/artikel. Klik chip untuk menghapus.
        </div>
      </div>
    </div>
  );
}
