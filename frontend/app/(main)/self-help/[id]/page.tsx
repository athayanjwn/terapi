"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./articleDetail.module.css";

type MeResponse = {
  user: { email: string };
  profile: {
    type?: "konselor" | "mahasiswa";
    id?: string; // id konselor
  };
};

type Article = {
  id: string;
  judul: string;
  isi: string;
  kategori: string[];
  tanggal_terbit: string;
  link_cover?: string;
  konselor?: {
    id?: string;
    nama_konselor?: string;
  };
};

function parseComma(s: string) {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function ArticleModal({
  open,
  title,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  initial?: { judul?: string; isi?: string; kategori?: string[] };
  onClose: () => void;
  onSubmit: (payload: { title: string; content: string; category: string[] }) => Promise<void>;
}) {
  const [judul, setJudul] = useState(initial?.judul ?? "");
  const [isi, setIsi] = useState(initial?.isi ?? "");
  const [kategoriText, setKategoriText] = useState((initial?.kategori ?? []).join(", "));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setJudul(initial?.judul ?? "");
    setIsi(initial?.isi ?? "");
    setKategoriText((initial?.kategori ?? []).join(", "));
    setSaving(false);
    setErr(null);
  }, [open, initial?.judul, initial?.isi, initial?.kategori]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!judul.trim() || !isi.trim()) {
      setErr("Judul dan isi wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      await onSubmit({
        title: judul.trim(),
        content: isi.trim(),
        category: parseComma(kategoriText),
      });
      onClose();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(720px, 100%)",
          background: "white",
          borderRadius: 14,
          padding: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 18 }}>
            ✕
          </button>
        </div>

        {err && (
          <div style={{ marginTop: 10, padding: 10, borderRadius: 10, border: "1px solid #f2b8b8", background: "#fff5f5" }}>
            <span style={{ color: "#b42318", fontSize: 13 }}>{err}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: 12, display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontSize: 12, opacity: 0.8, fontWeight: 600 }}>Judul</label>
            <input
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              placeholder="Judul artikel"
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontSize: 12, opacity: 0.8, fontWeight: 600 }}>Kategori (pisah koma)</label>
            <input
              value={kategoriText}
              onChange={(e) => setKategoriText(e.target.value)}
              style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              placeholder="contoh: Stress, Anxiety"
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontSize: 12, opacity: 0.8, fontWeight: 600 }}>Isi</label>
            <textarea
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              rows={10}
              style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              placeholder="Tulis isi artikel..."
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: "white", cursor: "pointer" }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #111",
                background: "#111",
                color: "white",
                cursor: "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ArticleDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [me, setMe] = useState<MeResponse | null>(null);

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setMe(data);
      } catch {}
    };
    fetchMe();
  }, []);

  async function fetchArticle() {
    const res = await fetch(`/api/article/${id}`, { cache: "no-store" });
    const data = await res.json();

    if (!res.ok) {
      setArticle(null);
      setLoading(false);
      return;
    }

    setArticle({
      ...data,
      kategori: Array.isArray(data.kategori) ? data.kategori : [],
    });

    setLoading(false);
  }

  useEffect(() => {
    fetchArticle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isCounselor = useMemo(() => me?.profile?.type === "konselor", [me]);

  const isOwner = useMemo(() => {
    if (!isCounselor) return false;
    const myId = me?.profile?.id;
    const ownerId = article?.konselor?.id;
    if (!myId || !ownerId) return false;
    return String(myId) === String(ownerId);
  }, [isCounselor, me, article]);

  async function handleUpdate(payload: { title: string; content: string; category: string[] }) {
    if (!article) return;

    const res = await fetch(`/api/article/${article.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Gagal update artikel");

    // refresh detail setelah update
    await fetchArticle();
  }

  async function handleDelete() {
    if (!article) return;
    const ok = confirm("Yakin hapus artikel ini?");
    if (!ok) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/article/${article.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data?.message || "Gagal menghapus artikel");
        return;
      }

      router.push("/self-help");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <p className={styles.loading}>Loading...</p>;
  if (!article) return <p className={styles.loading}>Artikel tidak ditemukan</p>;

  return (
    <div className={styles.container}>
      {/* OWNER ACTIONS */}
      <div className={styles.topBar}>
        

        {isOwner && (
          <div className={styles.actions}>
            <button
              onClick={() => setEditOpen(true)}
              className={styles.actionEdit}
              type="button"
            >
              Edit
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className={styles.actionDelete}
              type="button"
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </button>
          </div>
        )}
      </div>


      <ArticleModal
        open={editOpen}
        title="Edit Artikel"
        initial={{ judul: article.judul, isi: article.isi, kategori: article.kategori }}
        onClose={() => setEditOpen(false)}
        onSubmit={handleUpdate}
      />

      <h1 className={styles.title}>{article.judul}</h1>

      <p className={styles.meta}>
        {article.konselor?.nama_konselor ?? "Konselor"} •{" "}
        {new Date(article.tanggal_terbit).toLocaleDateString("id-ID")}
      </p>

      <div className={styles.categories}>
        {(article.kategori || []).map((k, i) => (
          <span key={i} className={styles.category}>
            {k}
          </span>
        ))}
      </div>

      <article className={styles.content}>{article.isi}</article>

      <button
          onClick={() => router.push("/self-help")}
          className={styles.backButton}
          type="button"
        >
          ← Kembali
      </button>
    </div>
  );
}
