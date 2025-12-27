"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./navbar.module.css";

type User = {
  nama_mahasiswa?: string;
  email?: string;
};

export default function Navbar() {
  const pathname = usePathname();

  // ✅ jangan render navbar di halaman login (dan register kalau ada)
  if (
  pathname === "/login" ||
  pathname.startsWith("/login/") ||
  pathname === "/register" ||
  pathname.startsWith("/register/") ||
  pathname === "/verify-email" ||
  pathname.startsWith("/verify-email/")
) {
  return null;
}


  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ dropdown state
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data.profile);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // ✅ close dropdown ketika klik di luar / ESC
  useEffect(() => {
    if (!openMenu) return;

    const onClickOutside = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpenMenu(false);
    };

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [openMenu]);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      window.location.href = "/";
    }
  };

  const initial = user?.nama_mahasiswa?.charAt(0).toUpperCase() ?? "U";
  

  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        <Link href="/">
          <Image src="/test.png" alt="logo" width={40} height={28} priority />
        </Link>
        <span className={styles.brandText}>Terapi</span>
      </div>

      <nav className={styles.menu}>
        <Link href="/">Home</Link>
        <Link href="/self-assessment">Self-Assessment</Link>

        {!loading && user && <Link href="/appointment">Appointment</Link>}

        <Link href="/self-help">Self-Help</Link>
      </nav>

      {!loading && (
        <>
          {!user ? (
            <Link href="/login" className={styles.signin}>
              Sign in
            </Link>
          ) : (
            <div className={styles.userWrap} ref={menuRef}>
              <button
                type="button"
                className={styles.profileTrigger}
                onClick={() => setOpenMenu((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={openMenu}
              >
                <span className={styles.avatar}>{initial}</span>
                <span className={styles.chevron} aria-hidden="true">▾</span>
              </button>

              {openMenu && (
                <div className={styles.dropdown} role="menu">
                  <Link
                    href="/me"
                    className={styles.dropdownItem}
                    role="menuitem"
                    onClick={() => setOpenMenu(false)}
                  >
                    Profile
                  </Link>

                  <button
                    type="button"
                    className={`${styles.dropdownItem} ${styles.dangerItem}`}
                    role="menuitem"
                    onClick={() => {
                      setOpenMenu(false);
                      logout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </header>
  );
}
