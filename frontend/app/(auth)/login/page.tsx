"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./login.module.css";

type LoginResponse = { message?: string };

/* ===== ICONS (SVG – sama seperti sebelumnya) ===== */
function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m6.5 8 5.2 4a.5.5 0 0 0 .6 0l5.2-4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M7 11V8.5A5 5 0 0 1 12 3.5a5 5 0 0 1 5 5V11"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M6.5 11h11A2.5 2.5 0 0 1 20 13.5v4A3 3 0 0 1 17 20.5H7A3 3 0 0 1 4 17.5v-4A2.5 2.5 0 0 1 6.5 11Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon({ off }: { off?: boolean }) {
  return off ? (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M10 10a3 3 0 0 0 4 4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M4 4l16 16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ===== PAGE ===== */
export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(
    () => email.length > 0 && password.length > 0 && !loading,
    [email, password, loading]
  );

  const login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Login gagal");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        {/* LEFT IMAGE */}
        <div className={styles.left}>
          <Image
            src="/signin-image.png"
            alt="Sign in"
            fill
            priority
            className={styles.leftImage}
          />
          <div className={styles.overlay} />

          {/* LOGO */}
          <div className={styles.brand}>
            <Image src="/logo.png" alt="Terapi" width={56} height={28} />
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className={styles.right}>
          <form className={styles.form} onSubmit={login}>
            <h1 className={styles.title}>Sign in</h1>
            <p className={styles.subtitle}>
              Selamat datang! Saatnya isi ulang energi positifmu
            </p>

            {/* EMAIL */}
            <label className={styles.label}>Email</label>
            <div className={styles.inputRow}>
              <span className={styles.icon}><MailIcon /></span>
              <input
                className={styles.input}
                type="email"
                placeholder="Masukkan alamat Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* PASSWORD */}
            <label className={styles.label}>Password</label>
            <div className={styles.inputRow}>
              <span className={styles.icon}><LockIcon /></span>
              <input
                className={styles.input}
                type={showPass ? "text" : "password"}
                placeholder="Masukkan Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.eye}
                onClick={() => setShowPass((v) => !v)}
                aria-label="Toggle password"
              >
                <EyeIcon off={!showPass} />
              </button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button className={styles.btn} disabled={!canSubmit}>
              {loading ? "Loading..." : "Login"}
            </button>

            <p className={styles.register}>
              Belum punya akun?{" "}
              <Link href="/register">
                <b>Daftar</b>
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
