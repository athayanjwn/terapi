import { supabaseLogin } from "../config/supabaseClient.js";

const ALLOWED_DOMAIN = "@student.telkomuniversity.ac.id";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isAllowedEmail(email) {
  return normalizeEmail(email).endsWith(ALLOWED_DOMAIN);
}

export default class AuthService {
  static async login(email, password) {
    try {
      const { data: authData, error: authError } =
        await supabaseLogin.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) throw new Error("Invalid email or password");

      // OPTIONAL: cek email verified (di supabase user)
      // catatan: field ini biasanya ada: authData.user?.email_confirmed_at
      if (!authData.user?.email_confirmed_at) {
        throw new Error("Email belum diverifikasi. Silakan cek email institusi kamu.");
      }

      return {
        id: authData.user?.id,
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
        expires_in: authData.session?.expires_in,
      };
    } catch (err) {
      console.error("Login Error:", err.message);
      throw err;
    }
  }

  static async register(name, email, password) {
    try {
      const normalized = normalizeEmail(email);

      if (!isAllowedEmail(normalized)) {
        throw new Error(
          `Email harus menggunakan akun institusi ${ALLOWED_DOMAIN}`
        );
      }

      // Supabase akan kirim email konfirmasi kalau "Confirm email" ON
      const { data, error } = await supabaseLogin.auth.signUp({
        email: normalized,
        password,
        options: {
          data: { name }, // simpan nama di user metadata
          emailRedirectTo: `${process.env.APP_BASE_URL}/verify-email`, // pastiin ini sesuai config
        },
      });

      if (error) {
        // biasanya kalau email sudah dipakai
        throw new Error(error.message || "Registrasi gagal");
      }

      return {
        id: data.user?.id,
        email: data.user?.email,
      };
    } catch (err) {
      console.error("Register Error:", err.message);
      throw err;
    }
  }

  static async resendVerification(email) {
    try {
      const normalized = normalizeEmail(email);

      if (!isAllowedEmail(normalized)) {
        throw new Error(
          `Email harus menggunakan akun institusi ${ALLOWED_DOMAIN}`
        );
      }

      // Supabase: kirim ulang email verifikasi
      const { error } = await supabaseLogin.auth.resend({
        type: "signup",
        email: normalized,
        options: {
          emailRedirectTo: `${process.env.APP_BASE_URL}/verify-email`,
        },
      });

      if (error) throw new Error(error.message || "Gagal kirim ulang email");

      return true;
    } catch (err) {
      console.error("Resend Error:", err.message);
      throw err;
    }
  }

  static async refreshToken(refreshToken) {
    try {
      if (!refreshToken) throw new Error("Tidak ada refresh Token, Silahkan Login Ulang");

      const { data, error } = await supabaseLogin.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) throw new Error(error.message || "Refresh token error");

      // OPTIONAL: jika session refresh berhasil tapi user belum verify (jarang), blok
      if (!data.user?.email_confirmed_at) {
        throw new Error("Email belum diverifikasi. Silakan cek email institusi kamu.");
      }

      return {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_in: data.session?.expires_in,
      };
    } catch (err) {
      console.error("Refresh token Error:", err.message);
      throw err;
    }
  }

  static async logout() {
    return true;
  }
}
