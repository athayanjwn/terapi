"use client";

import { useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

function toComma(arr?: string[]) {
  return Array.isArray(arr) ? arr.join(", ") : "";
}
function fromComma(s: string) {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

export default function MeEditClient({ me }: { me: any }) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const type = me?.profile?.type; // "konselor" / "mahasiswa"
  const role = me?.profile?.role;

  // ====== fields konselor ======
  const [namaK, setNamaK] = useState(me?.profile?.nama_konselor ?? "");
  const [telK, setTelK] = useState(me?.profile?.nomor_telepon ?? "");
  const [izin, setIzin] = useState(me?.profile?.nomor_izin_praktik ?? "");
  const [descK, setDescK] = useState(me?.profile?.deskripsi ?? "");
  const [fotoK, setFotoK] = useState(me?.profile?.foto_profil ?? "");
  const [spes, setSpes] = useState(toComma(me?.profile?.spesialisasi));
  const [bahasa, setBahasa] = useState(toComma(me?.profile?.bahasa));
  const [hari, setHari] = useState(toComma(me?.profile?.hari_praktik));
  const [tglK, setTglK] = useState(me?.profile?.tanggal_lahir ?? "");
  const [jkK, setJkK] = useState(me?.profile?.jenis_kelamin ?? "");

  // ====== fields mahasiswa ======
  const [namaM, setNamaM] = useState(me?.profile?.nama_mahasiswa ?? "");
  const [fak, setFak] = useState(me?.profile?.fakultas ?? "");
  const [prodi, setProdi] = useState(me?.profile?.program_studi ?? "");
  const [tahun, setTahun] = useState(me?.profile?.tahun_masuk ?? "");
  const [telM, setTelM] = useState(me?.profile?.nomor_telepon ?? "");
  const [tglM, setTglM] = useState(me?.profile?.tanggal_lahir ?? "");
  const [jkM, setJkM] = useState(me?.profile?.jenis_kelamin ?? "");
  const [fotoM, setFotoM] = useState(me?.profile?.foto_profil ?? "");

  const canSave = useMemo(() => {
    if (type === "konselor") return namaK.trim().length > 0;
    if (type === "mahasiswa") return namaM.trim().length > 0;
    return false;
  }, [type, namaK, namaM]);

  async function save() {
    try {
      setErr(null);
      setOk(null);
      if (!canSave) throw new Error("Nama wajib diisi.");

      setSaving(true);

      let payload: any = {};
      if (type === "konselor") {
        payload = {
          nama_konselor: namaK.trim(),
          nomor_telepon: telK.trim(),
          nomor_izin_praktik: izin.trim(),
          deskripsi: descK.trim(),
          foto_profil: fotoK.trim(),
          spesialisasi: fromComma(spes),
          bahasa: fromComma(bahasa),
          hari_praktik: fromComma(hari),
          tanggal_lahir: tglK || null,
          jenis_kelamin: jkK || null,
         
        };
      } else if (type === "mahasiswa") {
        payload = {
          nama_mahasiswa: namaM.trim(),
          fakultas: fak.trim(),
          program_studi: prodi.trim(),
          tahun_masuk: tahun.trim(),
          nomor_telepon: telM.trim(),
          tanggal_lahir: tglM || null,
          jenis_kelamin: jkM || null,
          foto_profil: fotoM.trim(),
         
        };
      } else {
        throw new Error("Tipe profile tidak dikenali.");
      }

      await apiFetch("/api/auth/me", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setOk("Profil berhasil diperbarui.");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-semibold text-gray-900">Profil Saya</h1>

        {(err || ok) && (
          <div className="mt-4 space-y-2">
            {err && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{err}</div>}
            {ok && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{ok}</div>}
          </div>
        )}

        <div className="mt-6 rounded-2xl border bg-white p-6 space-y-4">
          <div>
            <div className="text-sm text-gray-500">Email</div>
            <div className="font-medium">{me?.user?.email}</div>
          </div>

          {type === "konselor" ? (
            <div className="grid gap-3">
              <Input label="Nama Konselor" value={namaK} onChange={setNamaK} />
              <Input label="Nomor Izin Praktik" value={izin} onChange={setIzin} />
              <Input label="Nomor Telepon" value={telK} onChange={setTelK} />
              <Input label="Spesialisasi (pisah koma)" value={spes} onChange={setSpes} />
              <Input label="Bahasa (pisah koma)" value={bahasa} onChange={setBahasa} />
              <Input label="Hari Praktik (pisah koma)" value={hari} onChange={setHari} />
              <Input label="Tanggal Lahir (YYYY-MM-DD)" value={tglK} onChange={setTglK} />
              <Input label="Jenis Kelamin" value={jkK} onChange={setJkK} />
              <Textarea label="Deskripsi" value={descK} onChange={setDescK} />
            </div>
          ) : (
            <div className="grid gap-3">
              <Input label="Nama Mahasiswa" value={namaM} onChange={setNamaM} />
              <Input label="Fakultas" value={fak} onChange={setFak} />
              <Input label="Program Studi" value={prodi} onChange={setProdi} />
              <Input label="Tahun Masuk" value={tahun} onChange={setTahun} />
              <Input label="Nomor Telepon" value={telM} onChange={setTelM} />
              <Input label="Tanggal Lahir (YYYY-MM-DD)" value={tglM} onChange={setTglM} />
              <Input label="Jenis Kelamin" value={jkM} onChange={setJkM} />
            </div>
          )}

          <div className="pt-2">
            <button
              className="rounded-xl bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
              onClick={save}
              disabled={!canSave || saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <input
        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-gray-400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <textarea
        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-gray-400"
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
