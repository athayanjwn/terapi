"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const email = (sp.get("email") || "").trim().toLowerCase();

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // ✅ Tangkap hash dari Supabase: #access_token=...
  useEffect(() => {
    const hash = window.location.hash || "";
    if (hash.includes("access_token=")) {
      // (Opsional) tampilkan pesan singkat
      setMsg("Email berhasil diverifikasi. Mengarahkan ke login…");

      // bersihkan hash biar token tidak nempel di URL/history
      window.history.replaceState(null, "", "/verify-email");

      // redirect ke login
      setTimeout(() => router.replace("/login"), 600);
    }
  }, [router]);

  const resend = async () => {
    setLoading(true);
    setMsg("");
    setError("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.message ?? "Gagal kirim ulang email");
        return;
      }
      setMsg("Email verifikasi berhasil dikirim ulang. Cek inbox/spam.");
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbf9] grid place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Konfirmasi Email</h1>

        <p className="mt-2 text-sm text-gray-600">
          Kami sudah mengirim link verifikasi ke:
          <br />
          <b className="text-gray-900">{email || "(email tidak ditemukan)"}</b>
        </p>

        <div className="mt-5 grid gap-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
            Buka email kamu lalu klik tombol <b>Confirm</b>. Setelah itu, kamu bisa login.
          </div>

          {msg && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {msg}
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={resend}
            disabled={!email || loading}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-900 shadow-sm disabled:opacity-60"
          >
            {loading ? "Mengirim..." : "Kirim ulang email verifikasi"}
          </button>

          <div className="flex items-center justify-between text-sm">
            <Link className="font-semibold text-[#7c8263] hover:underline" href="/login">
              Ke halaman login
            </Link>
            <Link className="font-semibold text-[#7c8263] hover:underline" href="/register">
              Daftar ulang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
