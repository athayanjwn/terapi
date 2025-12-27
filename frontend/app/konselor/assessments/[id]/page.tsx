"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function CMSAssessmentMetaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const d = await apiFetch(`/api/self-assessments-cms/${id}/detail`);
        setData(d);
      } catch (e: any) {
        setErr(e.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const published = useMemo(() => !!data?.is_published, [data?.is_published]);

  function normalizeSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");
  }

  async function update() {
    try {
      setErr(null);
      setSaving(true);

      const payload = {
        title: String(data.title || "").trim(),
        description: String(data.description || "").trim(),
        tags: Array.isArray(data.tags) ? data.tags : [],
        slug: normalizeSlug(String(data.slug || "")),
        is_published: !!data.is_published,
      };

      if (!payload.slug) throw new Error("Slug wajib diisi.");
      if (!payload.title) throw new Error("Title wajib diisi.");

      await apiFetch(`/api/self-assessments-cms/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      // reload biar konsisten
      const fresh = await apiFetch(`/api/self-assessments-cms/${id}/detail`);
      setData(fresh);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function del() {
    if (!confirm("Hapus assessment ini?")) return;
    try {
      setErr(null);
      setDeleting(true);
      await apiFetch(`/api/self-assessments-cms/${id}`, { method: "DELETE" });
      router.push("/konselor/assessments");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <Link
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              href="/konselor/assessments"
            >
              <span className="text-base">←</span> Kembali ke daftar
            </Link>

            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Edit
              </h1>
              <span
                className={[
                  "rounded-full px-2.5 py-1 text-xs font-semibold border",
                  published
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200",
                ].join(" ")}
              >
                {published ? "Published" : "Draft"}
              </span>
            </div>

            <div className="text-xs text-slate-500 font-mono break-all">
              ID: {id}
            </div>
          </div>

        </div>

        {/* Alerts */}
        {err && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {err}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-32 rounded bg-slate-200" />
              <div className="h-11 w-full rounded-xl bg-slate-200" />
              <div className="h-4 w-28 rounded bg-slate-200" />
              <div className="h-11 w-full rounded-xl bg-slate-200" />
              <div className="h-4 w-36 rounded bg-slate-200" />
              <div className="h-28 w-full rounded-xl bg-slate-200" />
            </div>
          </div>
        )}

        {/* Form */}
        {data && !loading && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-5">
              {/* Slug */}
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-800">Slug</label>
                <input
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                  value={data.slug || ""}
                  onChange={(e) =>
                    setData((p: any) => ({ ...p, slug: e.target.value }))
                  }
                  placeholder="mis: stress-check"
                />
                <div className="text-xs text-slate-500">
                  Preview:{" "}
                  <span className="font-mono text-slate-700">
                    /{normalizeSlug(String(data.slug || ""))}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-800">Title</label>
                <input
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                  value={data.title || ""}
                  onChange={(e) =>
                    setData((p: any) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="Judul assessment"
                />
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-800">
                  Description
                </label>
                <textarea
                  className="min-h-[130px] rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                  value={data.description || ""}
                  onChange={(e) =>
                    setData((p: any) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Deskripsi yang muncul di halaman public"
                />
              </div>

              {/* Tags */}
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-800">Tags</label>
                <input
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                  value={(data.tags || []).join(", ")}
                  onChange={(e) =>
                    setData((p: any) => ({
                      ...p,
                      tags: e.target.value
                        .split(",")
                        .map((x) => x.trim())
                        .filter(Boolean)
                        .slice(0, 12),
                    }))
                  }
                  placeholder="pisahkan dengan koma: kecemasan, burnout"
                />

                {!!(data.tags?.length) && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {data.tags.slice(0, 12).map((t: string) => (
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

              {/* Published toggle */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-slate-900">
                    Status Publish
                  </div>
                  <div className="text-sm text-slate-600">
                    Jika Draft, tidak tampil di halaman mahasiswa/public.
                  </div>
                </div>

                <label className="inline-flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">
                    {published ? "Published" : "Draft"}
                  </span>
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) =>
                      setData((p: any) => ({
                        ...p,
                        is_published: e.target.checked,
                      }))
                    }
                    className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-200"
                  />
                </label>
              </div>

              {/* Actions bottom */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <button
                  onClick={update}
                  disabled={saving || deleting}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  onClick={del}
                  disabled={saving || deleting}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-50 disabled:opacity-60"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
