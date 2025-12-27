"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ArticleFormProps = {
  mode: "create" | "edit";
  articleId?: string;
  initial?: {
    title: string;
    content: string;
    category: string[];
  };
};

function parseComma(s: string) {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function ArticleForm({ mode, articleId, initial }: ArticleFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [categoryText, setCategoryText] = useState((initial?.category ?? []).join(", "));

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSave = useMemo(() => title.trim() && content.trim(), [title, content]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!canSave) {
      setErr("Judul dan isi wajib diisi.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: title.trim(),
        content: content.trim(),
        category: parseComma(categoryText),
      };

      const url = mode === "create" ? "/api/article" : `/api/article/${articleId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Gagal menyimpan artikel");

      router.push("/dashboard/articles");
      router.refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border bg-white p-6">
      {err && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {err}
        </div>
      )}

      <div>
        <label className="text-xs font-medium text-gray-600">Judul</label>
        <input
          className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-gray-400"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul artikel"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600">Kategori (pisah koma)</label>
        <input
          className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-gray-400"
          value={categoryText}
          onChange={(e) => setCategoryText(e.target.value)}
          placeholder="contoh: Stress, Anxiety, Self Growth"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600">Isi</label>
        <textarea
          className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-gray-400"
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tulis isi artikel..."
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {saving ? "Saving..." : mode === "create" ? "Tambah Artikel" : "Simpan Perubahan"}
      </button>
    </form>
  );
}
