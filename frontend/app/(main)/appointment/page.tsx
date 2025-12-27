"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./appointment.module.css";

type Konselor = {
  id: string;
  nama_konselor: string;
  spesialisasi: string[];
  foto_profil?: string | null;
  deskripsi?: string | null;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type KonselorResponse = {
  data: Konselor[];
  pagination: Pagination;
};

type User = {
  id: string;
  type: "mahasiswa" | "konselor";
};

type Appt = {
  id: string;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELED";
  id_mahasiswa?: string;
  id_konselor?: string;
};

function getInitial(name: string) {
  return (name?.trim()?.[0] || "?").toUpperCase();
}

function renderSpesialisasi(arr: any): string {
  if (!Array.isArray(arr)) return String(arr ?? "").trim();
  return arr
    .map((x) => String(x ?? "").trim())
    .filter(Boolean)
    .join(" • ");
}

function fallbackDesc(k: Konselor) {
  return (
    k.deskripsi ||
    "Konselor berfokus pada isu-isu keseharian mahasiswa. Dengan pendekatan yang hangat dan empatik, membantu mahasiswa menemukan arah dan strategi coping yang tepat."
  );
}

export default function AppointmentListPage() {
  const LIMIT = 10;

  // list konselor
  const [items, setItems] = useState<Konselor[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: LIMIT,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [speciality, setSpeciality] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // modal appointment saya
  const [openModal, setOpenModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [myItems, setMyItems] = useState<Appt[]>([]);
  const [myLoading, setMyLoading] = useState(false);
  const [myErr, setMyErr] = useState<string | null>(null);
  const [myOk, setMyOk] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  // load konselor
  useEffect(() => {
    const load = async () => {
      try {
        setErr(null);
        setLoading(true);

        const res = await fetch(`/api/appointment?page=${page}&limit=${LIMIT}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const json = (await res.json()) as KonselorResponse | any;
        if (!res.ok) throw new Error(json?.message || "Gagal memuat konselor");

        const dataArr = Array.isArray(json?.data) ? (json.data as Konselor[]) : [];
        setItems(dataArr);

        setPagination(
          json?.pagination ?? {
            page,
            limit: LIMIT,
            total: dataArr.length,
            totalPages: 1,
          }
        );
      } catch (e: any) {
        setErr(e.message || "Terjadi kesalahan");
        setItems([]);
        setPagination({ page, limit: LIMIT, total: 0, totalPages: 1 });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page]);

  // speciality dropdown
  const allSpecialities = useMemo(() => {
    const set = new Set<string>();
    items.forEach((k) => {
      const arr = Array.isArray(k.spesialisasi) ? k.spesialisasi : [];
      arr.forEach((sp) => {
        const s = String(sp ?? "").trim();
        if (s) set.add(s);
      });
    });
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b, "id-ID"))];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (speciality === "all") return items;
    return items.filter((k) => {
      const arr = Array.isArray(k.spesialisasi) ? k.spesialisasi : [];
      return arr.map((x) => String(x ?? "").trim()).includes(speciality);
    });
  }, [items, speciality]);

  const pages = useMemo(() => {
    const totalPages = pagination.totalPages || 1;
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [pagination.totalPages]);

  // ===== modal helpers =====
  async function loadMe() {
    const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    console.log(data);
    return (data?.profile ?? null) as User | null;
  }

  async function loadMyAppointments() {
    try {
      setMyErr(null);
      setMyOk(null);
      setMyLoading(true);

      const u = user ?? (await loadMe());
      setUser(u);

      const res = await fetch("/api/appointment/my", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Gagal memuat appointment");

      setMyItems(Array.isArray(data) ? (data as Appt[]) : []);
    } catch (e: any) {
      setMyErr(e.message || "Terjadi kesalahan");
      setMyItems([]);
    } finally {
      setMyLoading(false);
    }
  }

  function canCancel(a: Appt) {
    return user?.type === "mahasiswa" && (a.status === "PENDING" || a.status === "ACCEPTED");
  }

  function canAcceptReject(a: Appt) {
    return user?.type === "konselor" && a.status === "PENDING";
  }

  async function doAction(kind: "cancel" | "accept" | "reject", id: string) {
    try {
      setActingId(id);
      setMyErr(null);
      setMyOk(null);

      const res = await fetch(`/api/appointment/${id}/${kind}`, {
        method: "PUT",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || `Gagal ${kind} appointment`);

      setMyOk(
        kind === "cancel"
          ? "Appointment berhasil dibatalkan."
          : kind === "accept"
          ? "Appointment berhasil diterima."
          : "Appointment berhasil ditolak."
      );

      await loadMyAppointments();
    } catch (e: any) {
      setMyErr(e.message || "Terjadi kesalahan");
    } finally {
      setActingId(null);
    }
  }

  // buka modal -> load data
  useEffect(() => {
    if (openModal) loadMyAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  // close modal via ESC
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenModal(false);
    }
    if (openModal) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openModal]);

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.titleWrap}>
          <h1 className={styles.title}>Daftar Konselor</h1>

          <div className={styles.filterWrap}>
            <select
              className={styles.select}
              value={speciality}
              onChange={(e) => setSpeciality(e.target.value)}
              aria-label="Filter speciality"
            >
              <option value="all">Speciality</option>
              {allSpecialities
                .filter((s) => s !== "all")
                .map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
            </select>

            <button className={styles.myBtn} onClick={() => setOpenModal(true)}>
              Appointment Saya
            </button>
          </div>
        </div>
      </div>

      {loading && <div className={styles.metaText}>Loading...</div>}
      {err && <div className={styles.state}>{err}</div>}

      <div className={styles.grid}>
        {!loading &&
          !err &&
          filteredItems.map((k) => (
            <div key={k.id} className={styles.card}>
              <div className={styles.avatar}>
                {k.foto_profil ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={k.foto_profil} alt={k.nama_konselor} />
                ) : (
                  <div className={styles.avatarInitial}>{getInitial(k.nama_konselor)}</div>
                )}
              </div>

              <div className={styles.cardBody}>
                <p className={styles.name}>{k.nama_konselor}</p>
                <div className={styles.special}>{renderSpesialisasi(k.spesialisasi)}</div>

                <div className={styles.desc}>{fallbackDesc(k)}</div>

                <div className={styles.actions}>
                  <Link className={`${styles.btn} ${styles.btnPrimary}`} href={`/appointment/${k.id}`}>
                    Lihat Detail
                  </Link>
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className={styles.metaRow}>
        <div className={styles.metaText}>
          Menampilkan {filteredItems.length} dari {pagination.total} konselor • Halaman {pagination.page}/
          {pagination.totalPages}
        </div>

        {!loading && !err && pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </button>

            {pages.map((p) => (
              <button
                key={p}
                className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ""}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}

            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ===== MODAL ===== */}
      {openModal && (
        <div className={styles.modalOverlay} onMouseDown={() => setOpenModal(false)}>
          <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalTitle}>Appointment Saya</div>
                <div className={styles.modalSub}>
                  {user ? `Role: ${user.type}` : "Memuat user..."}
                </div>
              </div>

              <button className={styles.modalClose} onClick={() => setOpenModal(false)}>
                ✕
              </button>
            </div>

            {myLoading && <div className={styles.modalState}>Loading...</div>}
            {myErr && <div className={styles.modalErr}>{myErr}</div>}
            {myOk && <div className={styles.modalOk}>{myOk}</div>}

            <div className={styles.modalList}>
              {!myLoading && !myErr && myItems.length === 0 && (
                <div className={styles.modalEmpty}>Belum ada appointment.</div>
              )}

              {myItems.map((a) => (
                <div key={a.id} className={styles.modalCard}>
                  <div className={styles.modalInfo}>
                    <div className={styles.modalLine1}>
                      {a.tanggal} • {a.jam_mulai} - {a.jam_selesai}
                    </div>
                    <div className={styles.modalLine2}>ID: {a.id}</div>
                  </div>

                  <div className={styles.modalActions}>
                    <span className={styles.badge}>{a.status}</span>

                    {canCancel(a) && (
                      <button
                        className={`${styles.btnSmall} ${styles.btnDanger}`}
                        onClick={() => doAction("cancel", a.id)}
                        disabled={actingId === a.id}
                      >
                        {actingId === a.id ? "..." : "Cancel"}
                      </button>
                    )}

                    {canAcceptReject(a) && (
                      <>
                        <button
                          className={`${styles.btnSmall} ${styles.btnPrimary}`}
                          onClick={() => doAction("accept", a.id)}
                          disabled={actingId === a.id}
                        >
                          {actingId === a.id ? "..." : "Accept"}
                        </button>
                        <button
                          className={`${styles.btnSmall} ${styles.btnGhost}`}
                          onClick={() => doAction("reject", a.id)}
                          disabled={actingId === a.id}
                        >
                          {actingId === a.id ? "..." : "Reject"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSmall + " " + styles.btnGhost} onClick={loadMyAppointments}>
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
