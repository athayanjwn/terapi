"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./article.module.css";

type MeResponse = {
  user: { email: string };
  profile: {
    type?: "konselor" | "mahasiswa";
    id?: string;
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
      setErr(e?.message || "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.iconButton} onClick={onClose} aria-label="Tutup">
            ✕
          </button>
        </div>

        {err && (
          <div className={styles.alertError}>
            <span>{err}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.field}>
            <label className={styles.label}>Judul</label>
            <input
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className={styles.input}
              placeholder="Judul artikel"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Kategori (pisah koma)</label>
            <input
              value={kategoriText}
              onChange={(e) => setKategoriText(e.target.value)}
              className={styles.input}
              placeholder="contoh: Stress, Anxiety"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Isi</label>
            <textarea
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              rows={10}
              className={styles.textarea}
              placeholder="Tulis isi artikel..."
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.buttonGhost}>
              Batal
            </button>
            <button type="submit" disabled={saving} className={styles.buttonPrimary}>
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SelfHelpPage() {
  const [me, setMe] = useState<MeResponse | null>(null);

  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const [addOpen, setAddOpen] = useState(false);

  const isCounselor = useMemo(() => me?.profile?.type === "konselor", [me]);

  async function fetchArticles(currentPage = page) {
    const res = await fetch(`/api/article?page=${currentPage}&limit=${limit}`, {
      cache: "no-store",
    });
    const result = await res.json();
    setArticles(Array.isArray(result.data) ? result.data : []);
    setTotalPages(result.totalPages || 1);
  }

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

  useEffect(() => {
    fetchArticles(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function handleCreate(payload: { title: string; content: string; category: string[] }) {
    const res = await fetch("/api/article", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Gagal membuat artikel");

    setPage(1);
    await fetchArticles(1);
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <p className={styles.subtitle}>Artikel singkat untuk bantu kamu memahami dan mengelola kondisimu dengan lebih baik.</p>
        </div>

        {isCounselor && (
          <button onClick={() => setAddOpen(true)} className={styles.buttonPrimary}>
            + Tambah Artikel
          </button>
        )}
      </div>

      <ArticleModal open={addOpen} title="Tambah Artikel" onClose={() => setAddOpen(false)} onSubmit={handleCreate} />

      <div className={styles.list}>
        {articles.map((article) => (
          <Link key={article.id} href={`/self-help/${article.id}`} className={styles.card}>
            {article.link_cover ? (
              <div className={styles.coverWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.link_cover} alt={article.judul} className={styles.coverImg} />
              </div>
            ) : (
              <div className={styles.coverPlaceholder} />
            )}

            <div className={styles.cardBody}>
              <h2 className={styles.cardTitle}>{article.judul}</h2>

              <p className={styles.meta}>
                <span className={styles.metaName}>{article.konselor?.nama_konselor ?? "Konselor"}</span>
                <span className={styles.metaDot}>•</span>
                <span>{new Date(article.tanggal_terbit).toLocaleDateString("id-ID")}</span>
              </p>

              <p className={styles.excerpt}>{article.isi}</p>

              <div className={styles.categories}>
                {(article.kategori || []).slice(0, 4).map((k, i) => (
                  <span key={i} className={styles.category}>
                    {k}
                  </span>
                ))}
                {(article.kategori || []).length > 4 && (
                  <span className={styles.categoryMuted}>+{(article.kategori || []).length - 4}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.pagination}>
        <button
          className={styles.navButton}
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>

        <div className={styles.pageGroup}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`${styles.pageButton} ${page === i + 1 ? styles.active : ""}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          className={styles.navButton}
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}
