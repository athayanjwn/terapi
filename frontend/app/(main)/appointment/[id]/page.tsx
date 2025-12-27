"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./detail.module.css";

type Jadwal = {
  id: string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
};

type Booked = {
  jam_mulai: string;
  jam_selesai: string;
};

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

function fallbackDesc(k?: Partial<Konselor> | null) {
  return (
    k?.deskripsi ||
    "Konselor berfokus pada isu-isu keseharian mahasiswa. Dengan pendekatan yang hangat dan empatik, membantu mahasiswa menemukan arah dan strategi coping yang tepat."
  );
}

function toHariID(dateISO: string) {
  return new Date(dateISO)
    .toLocaleDateString("id-ID", { weekday: "long" })
    .toLowerCase();
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(min: number) {
  const h = String(Math.floor(min / 60)).padStart(2, "0");
  const m = String(min % 60).padStart(2, "0");
  return `${h}:${m}`;
}

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return timeToMinutes(aStart) < timeToMinutes(bEnd) && timeToMinutes(aEnd) > timeToMinutes(bStart);
}

function getMinDateTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().slice(0, 10);
}

export default function AppointmentBookingPage() {
  const { id } = useParams<{ id: string }>(); // id konselor
  const router = useRouter();

  const DURASI = 30;

  const [konselor, setKonselor] = useState<Konselor | null>(null);

  const [jadwal, setJadwal] = useState<Jadwal[]>([]);
  const [booked, setBooked] = useState<Booked[]>([]);

  const [tanggal, setTanggal] = useState(() => getMinDateTomorrow());
  const [selectedStart, setSelectedStart] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // ✅ ambil info konselor (fallback: ambil dari list endpoint)
  useEffect(() => {
    (async () => {
      try {
        // NOTE: ini fallback saja, karena kamu belum punya endpoint detail konselor
        // Jika kamu punya endpoint detail, ganti fetch ini dengan /api/konselor/${id}
        const LIMIT = 50; // biar kemungkinan ketemu lebih besar
        const res = await fetch(`/api/appointment?page=1&limit=${LIMIT}`, {
          credentials: "include",
          cache: "no-store",
        });
        const json = (await res.json()) as KonselorResponse | any;
        if (!res.ok) return;

        const arr = Array.isArray(json?.data) ? (json.data as Konselor[]) : [];
        const found = arr.find((k) => String(k.id) === String(id));
        if (found) {
          setKonselor({
            id: String(found.id),
            nama_konselor: found.nama_konselor,
            spesialisasi: Array.isArray(found.spesialisasi) ? found.spesialisasi : [],
            foto_profil: found.foto_profil ?? null,
            deskripsi: found.deskripsi ?? null,
          });
        }
      } catch {
        // silent
      }
    })();
  }, [id]);

  // load jadwal konselor
  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const res = await fetch(`/api/appointment/${id}`, {
          credentials: "include",
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Gagal mengambil jadwal");

        setJadwal(
          (Array.isArray(data) ? data : []).map((j: any) => ({
            ...j,
            hari: String(j.hari || "").toLowerCase(),
          }))
        );
      } catch (e: any) {
        setErr(e?.message || "Terjadi kesalahan");
      }
    })();
  }, [id]);

  // load booked slot per tanggal
  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setOk(null);
        setSelectedStart(null);

        const res = await fetch(
          `/api/appointment/${id}/tanggal?tanggal=${encodeURIComponent(tanggal)}`,
          {
            credentials: "include",
            cache: "no-store",
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Gagal mengambil booked slot");

        setBooked(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setErr(e?.message || "Terjadi kesalahan");
      }
    })();
  }, [id, tanggal]);

  const jadwalHariIni = useMemo(() => {
    const hari = toHariID(tanggal);
    return jadwal.filter((j) => j.hari === hari);
  }, [jadwal, tanggal]);

  const slotStarts = useMemo(() => {
    if (!jadwalHariIni.length) return [];
    const all: string[] = [];

    for (const j of jadwalHariIni) {
      const start = timeToMinutes(j.jam_mulai);
      const end = timeToMinutes(j.jam_selesai);
      for (let t = start; t + DURASI <= end; t += 30) {
        all.push(minutesToTime(t));
      }
    }

    return Array.from(new Set(all)).sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
  }, [jadwalHariIni]);

  function isDisabled(start: string) {
    const end = minutesToTime(timeToMinutes(start) + DURASI);
    return booked.some((b) => overlaps(start, end, b.jam_mulai, b.jam_selesai));
  }

  async function submit() {
    try {
      setLoading(true);
      setErr(null);
      setOk(null);

      if (!selectedStart) throw new Error("Pilih slot dulu");

      const jam_mulai = selectedStart;
      const jam_selesai = minutesToTime(timeToMinutes(selectedStart) + DURASI);

      const res = await fetch("/api/appointment", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          id_konselor: id,
          tanggal,
          jam_mulai,
          jam_selesai,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Gagal membuat appointment");

      setOk("Appointment berhasil dibuat (PENDING).");
      setSelectedStart(null);

      const r2 = await fetch(
        `/api/appointment/${id}/tanggal?tanggal=${encodeURIComponent(tanggal)}`,
        { credentials: "include", cache: "no-store" }
      );
      const b2 = await r2.json();
      if (r2.ok) setBooked(Array.isArray(b2) ? b2 : []);
    } catch (e: any) {
      setErr(e?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  const jadwalText = useMemo(() => {
    if (!jadwalHariIni.length) return "Tidak ada";
    return jadwalHariIni.map((j) => `${j.jam_mulai}-${j.jam_selesai}`).join(", ");
  }, [jadwalHariIni]);

  const minTanggal = getMinDateTomorrow();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* ✅ KONSELOR INFO */}
        <div className={styles.konselorCard}>
          <div className={styles.konselorLeft}>
            <div className={styles.avatarWrap}>
              {konselor?.foto_profil ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={konselor.foto_profil} alt={konselor.nama_konselor} className={styles.avatar} />
              ) : (
                <div className={styles.avatarFallback}>
                  {getInitial(konselor?.nama_konselor || "Konselor")}
                </div>
              )}
            </div>

            <div className={styles.konselorInfo}>
              <div className={styles.konselorName}>{konselor?.nama_konselor || "Konselor"}</div>
              <div className={styles.konselorSub}>
                {konselor?.spesialisasi?.length ? renderSpesialisasi(konselor.spesialisasi) : "Speciality belum tersedia"}
              </div>
              <div className={styles.konselorDesc}>{fallbackDesc(konselor)}</div>

              <div className={styles.konselorMeta}>
                Durasi sesi <b>30 menit</b> <span className={styles.dot}>•</span> Minimal tanggal <b>{minTanggal}</b>
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className={styles.controls}>
          <div className={styles.control}>
            <div className={styles.label}>Tanggal</div>
            <input
              className={styles.input}
              type="date"
              value={tanggal}
              min={minTanggal}
              onChange={(e) => {
                const v = e.target.value;
                setTanggal(v < minTanggal ? minTanggal : v);
              }}
            />
            <div className={styles.help}>Tidak bisa memilih hari ini/kemarin.</div>
          </div>
        </div>

        <div className={styles.meta}>
          Jadwal hari <b>{toHariID(tanggal)}</b>: <span>{jadwalText}</span>
        </div>

        {err && <div className={styles.error}>{err}</div>}
        {ok && <div className={styles.ok}>{ok}</div>}

        {!jadwalHariIni.length ? (
          <div className={styles.empty}>Tidak ada jadwal di hari ini. Coba pilih tanggal lain.</div>
        ) : (
          <div className={styles.grid}>
            {slotStarts.map((s) => {
              const disabled = isDisabled(s) || loading;
              const end = minutesToTime(timeToMinutes(s) + DURASI);
              const active = selectedStart === s;

              return (
                <button
                  key={s}
                  className={[
                    styles.slotBtn,
                    disabled ? styles.slotBtnDisabled : "",
                    active ? styles.slotBtnActive : "",
                  ].join(" ")}
                  disabled={disabled}
                  onClick={() => setSelectedStart(s)}
                  type="button"
                >
                  <div className={styles.slotTime}>{s}</div>
                  <div className={styles.slotSub}>s/d {end}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* ACTIONS */}
        <div className={styles.actions}>
          <button
            className={styles.primaryBtn}
            onClick={submit}
            disabled={!selectedStart || loading || !jadwalHariIni.length}
            type="button"
          >
            {loading ? "Memproses..." : "Konfirmasi Booking"}
          </button>

          <button
            className={styles.ghostBtn}
            onClick={() => setSelectedStart(null)}
            disabled={loading}
            type="button"
          >
            Reset
          </button>

          <button
            className={styles.backBottomBtn}
            onClick={() => router.push("/appointment")}
            disabled={loading}
            type="button"
          >
            ← Kembali
          </button>
        </div>
      </div>
    </div>
  );
}
