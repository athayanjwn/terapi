import { supabase } from "../config/supabaseClient.js";

export default class ProfileService {
  static async updateMyProfile(userId, payload) {
    // cek user ini konselor atau mahasiswa
    const { data: konselor } = await supabase
      .from("konselor")
      .select("id, role, type")
      .eq("id", userId)
      .maybeSingle();

    if (konselor) {
      // ✅ whitelist field yang boleh diubah (role & type tidak)
      const allowed = {
        nama_konselor: payload.nama_konselor,
        nomor_telepon: payload.nomor_telepon,
        deskripsi: payload.deskripsi,
        foto_profil: payload.foto_profil,
        spesialisasi: Array.isArray(payload.spesialisasi) ? payload.spesialisasi : undefined,
        bahasa: Array.isArray(payload.bahasa) ? payload.bahasa : undefined,
        hari_praktik: Array.isArray(payload.hari_praktik) ? payload.hari_praktik : undefined,
        tanggal_lahir: payload.tanggal_lahir,
        jenis_kelamin: payload.jenis_kelamin,
        nomor_izin_praktik: payload.nomor_izin_praktik, // kalau mau boleh diubah
      };

      // buang undefined biar nggak overwrite jadi null
      Object.keys(allowed).forEach((k) => allowed[k] === undefined && delete allowed[k]);

      const { data, error } = await supabase
        .from("konselor")
        .update(allowed)
        .eq("id", userId)
        .select("*")
        .single();

      if (error) throw error;
      return data;
    }

    const { data: mahasiswa } = await supabase
      .from("mahasiswa")
      .select("id, type")
      .eq("id", userId)
      .maybeSingle();

    if (mahasiswa) {
      const allowed = {
        nama_mahasiswa: payload.nama_mahasiswa,
        fakultas: payload.fakultas,
        program_studi: payload.program_studi,
        tahun_masuk: payload.tahun_masuk,
        nomor_telepon: payload.nomor_telepon,
        tanggal_lahir: payload.tanggal_lahir,
        jenis_kelamin: payload.jenis_kelamin,
        foto_profil: payload.foto_profil,
        // status_akun biasanya jangan editable user (kalau kamu mau, boleh whitelist)
      };

      Object.keys(allowed).forEach((k) => allowed[k] === undefined && delete allowed[k]);

      const { data, error } = await supabase
        .from("mahasiswa")
        .update(allowed)
        .eq("id", userId)
        .select("*")
        .single();

      if (error) throw error;
      return data;
    }

    throw new Error("Profile tidak ditemukan.");
  }
}
