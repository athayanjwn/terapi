"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { SAAssessmentListItem } from "@/lib/types/selfAssessment";

export default function CMSAssessmentsPage() {
  const [items, setItems] = useState<SAAssessmentListItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // form create
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  // UI state
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch<any[]>("/api/self-assessments-cms");
      setItems(Array.isArray(data) ? (data as any) : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch((e: any) => setErr(e.message));
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((a) => {
      const hay = `${a.title ?? ""} ${a.slug ?? ""} ${(a.tags ?? []).join(" ")}`.toLowerCase();
      return hay.includes(s);
    });
  }, [items, q]);

  const stats = useMemo(() => {
    const total = items.length;
    const published = items.filter((x: any) => x.is_published || x.isPublished).length;
    const draft = total - published;
    return { total, published, draft };
  }, [items]);

  function normalizeSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");
  }

  async function create() {
    try {
      setErr(null);

      const cleanSlug = normalizeSlug(slug);
      if (!cleanSlug) throw new Error("Slug wajib diisi.");
      if (!title.trim()) throw new Error("Title wajib diisi.");

      const body = {
        slug: cleanSlug,
        title: title.trim(),
        description: description.trim(),
        tags: tags
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean)
          .slice(0, 12),
        is_published: isPublished,
      };

      await apiFetch("/api/self-assessments", {
        method: "POST",
        body: JSON.stringify(body),
      });

      setSlug("");
      setTitle("");
      setDescription("");
      setTags("");
      setIsPublished(false);
      await load();
    } catch (e: any) {
      setErr(e.message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              CMS Self-Assessment
            </h1>
            <p className="text-sm text-slate-600">
              Kelola metadata assessment, pertanyaan, dan rules untuk rekomendasi konselor.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[360px]">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                {/* search icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M16.5 16.5 21 21"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <input
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                placeholder="Cari title / slug / tags..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <button
              onClick={() => load().catch((e: any) => setErr(e.message))}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              {/* refresh icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 12a8 8 0 1 1-2.34-5.66"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <path
                  d="M20 4v6h-6"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Stats + Error */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-600">Total</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{stats.total}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-600">Published</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{stats.published}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-600">Draft</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{stats.draft}</div>
          </div>
        </div>

        {err && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {err}
          </div>
        )}

        {/* Create Card */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-base font-semibold text-slate-900">
                Buat Assessment Baru
              </div>
              <div className="text-sm text-slate-600">
                Isi metadata dasar. Setelah dibuat, lanjutkan ke Questions & Rules.
              </div>
            </div>

            <button
              onClick={create}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              {/* plus icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                />
              </svg>
              Create
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-800">Slug</label>
              <input
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                placeholder="mis: stress-check"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <div className="text-xs text-slate-500">
                Otomatis dibersihkan: spasi → <span className="font-mono">-</span>, huruf kecil.
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-800">Title</label>
              <input
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                placeholder="Judul assessment"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <label className="text-sm font-medium text-slate-800">Description</label>
              <textarea
                className="min-h-[110px] rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                placeholder="Deskripsi singkat yang akan tampil di card"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <label className="text-sm font-medium text-slate-800">Tags</label>
              <input
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                placeholder="pisahkan dengan koma: kecemasan, burnout"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              {!!tags.trim() && (
                <div className="flex flex-wrap gap-2">
                  {tags
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean)
                    .slice(0, 8)
                    .map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                      >
                        {t}
                      </span>
                    ))}
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-200"
              />
              Published
            </label>
          </div>
        </div>

        {/* List */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">
              Assessments
              <span className="ml-2 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-600">
                {filtered.length}
              </span>
            </div>
            {loading && <div className="text-sm text-slate-500">Loading...</div>}
          </div>

          <div className="mt-3 grid gap-3">
            {filtered.map((a: any) => {
              const published = !!(a.is_published ?? a.isPublished);
              return (
                <div
                  key={a.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-base font-semibold text-slate-900">
                          {a.title}
                        </div>
                        <span
                          className={[
                            "rounded-full px-2.5 py-1 text-xs font-semibold",
                            published
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200",
                          ].join(" ")}
                        >
                          {published ? "Published" : "Draft"}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        <span className="font-mono text-xs text-slate-500">/{a.slug}</span>
                      </div>

                      {!!(a.tags?.length) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {a.tags.slice(0, 8).map((t: string) => (
                            <span
                              key={t}
                              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      <Link
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        href={`/konselor/assessments/${a.id}`}
                      >
                        Edit Meta
                      </Link>
                      <Link
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        href={`/konselor/assessments/${a.id}/questions`}
                      >
                        Questions
                      </Link>
                      <Link
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        href={`/konselor/assessments/${a.id}/rules`}
                      >
                        Rules
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {!filtered.length && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
                Tidak ada assessment yang cocok.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
