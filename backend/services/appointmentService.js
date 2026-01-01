import { supabase } from "../config/supabaseClient.js";

export default class AppointmentService {
  static async create({
    id_mahasiswa,
    id_konselor,
    tanggal,
    jam_mulai,
    jam_selesai,
  }) {
    if (jam_selesai <= jam_mulai) {
      throw new Error("Jam selesai harus lebih besar dari jam mulai");
    }

    const hari = new Date(tanggal).toLocaleDateString("id-ID", {
      weekday: "long",
    });

    const toTimeSS = (t) => (t.length === 5 ? `${t}:00` : t);

    jam_mulai = toTimeSS(jam_mulai);
    jam_selesai = toTimeSS(jam_selesai);

    // console.log(hari.toLowerCase())
    // VALIDASI JADWAL PRAKTIK
    const { data: jadwal } = await supabase
      .from("jadwal")
      .select("*")
      .eq("id_konselor", id_konselor)
      .eq("hari", hari.toLowerCase())
      .eq("is_true", true)
      .lte("jam_mulai", jam_mulai)
      .gte("jam_selesai", jam_selesai)
      .limit(1);

    // console.log(jadwal)
    if (!jadwal) {
      throw new Error("Diluar jam praktik konselor");
    }

    // CEK BENTROK APPOINTMENT
    const { data: conflict } = await supabase
      .from("appointment")
      .select("id")
      .eq("id_konselor", id_konselor)
      .eq("tanggal", tanggal)
      .in("status", ["PENDING", "ACCEPTED"])
      .lt("jam_mulai", jam_selesai)
      .gt("jam_selesai", jam_mulai)
      .maybeSingle();

    if (conflict) {
      throw new Error("Jadwal sudah terisi");
    }

    // 3. INSERT APPOINTMENT
    const { data, error } = await supabase
      .from("appointment")
      .insert({
        id_mahasiswa,
        id_konselor,
        tanggal,
        jam_mulai,
        jam_selesai,
        status: "PENDING",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async cancel(id, user) {
    const { data: appt } = await supabase
      .from("appointment")
      .select("*")
      .eq("id", id)
      .single();

    if (!appt) throw new Error("Appointment tidak ditemukan");

    const today = new Date();
    const tanggalAppt = new Date(appt.tanggal);
    const diffDays = (tanggalAppt - today) / (1000 * 60 * 60 * 24);

    if (diffDays < 1) {
      throw new Error("Cancel hanya bisa maksimal H-1");
    }

    if (
      user.type === "mahasiswa" &&
      appt.mahasiswa_id !== user.id
    ) {
      throw new Error("Tidak berhak membatalkan appointment ini");
    }

    await supabase
      .from("appointment")
      .update({ status: "CANCELED" })
      .eq("id", id);
  }

  static async accept(id, konselor_id) {
    const { data: appt } = await supabase
      .from("appointment")
      .select("*")
      .eq("id", id)
      .single();

    if (!appt) throw new Error("Appointment tidak ditemukan");

    if (appt.id_konselor !== konselor_id) {
      throw new Error("Tidak berhak");
    }

    await supabase
      .from("appointment")
      .update({ status: "ACCEPTED" })
      .eq("id", id);
  }

  static async reject(id, konselor_id) {
    const { data: appt } = await supabase
      .from("appointment")
      .select("*")
      .eq("id", id)
      .single();

    if (!appt) throw new Error("Appointment tidak ditemukan");

    if (appt.id_konselor !== konselor_id) {
      throw new Error("Tidak berhak");
    }

    await supabase
      .from("appointment")
      .update({ status: "REJECTED" })
      .eq("id", id);
  }

    static async getJadwalPraktikKonselor(konselor_id) {
        const { data, error } = await supabase
            .from("v_jadwal_urut")
            .select("id, hari, jam_mulai, jam_selesai")
            .eq("id_konselor", konselor_id)
            .eq("is_true", true)
            .order("hari_urut", { ascending: true })
            .order("jam_mulai", { ascending: true });

        if (error) throw error;
        return data;
    }


    static async getBookedSlot(konselor_id, tanggal) {
        const { data, error } = await supabase
            .from("appointment")
            .select("jam_mulai, jam_selesai")
            .eq("id_konselor", konselor_id)
            .eq("tanggal", tanggal)
            .in("status", ["PENDING", "ACCEPTED"]);

        if (error) throw error;
        return data;
    }

    // services/appointmentService.js
    static async getAllActive({ page = 1, limit = 10 }) {
        page = Number(page);
        limit = Number(limit);

        if (!Number.isFinite(page) || page < 1) page = 1;
        if (!Number.isFinite(limit) || limit < 1) limit = 10;

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await supabase
            .from("konselor")
            .select(
            `
                id,
                nama_konselor,
                spesialisasi,
                foto_profil
            `,
            { count: "exact" } 
            )
            .order("nama_konselor", { ascending: true })
            .range(from, to);

        if (error) throw error;

        const total = count ?? 0;
        const totalPages = Math.max(1, Math.ceil(total / limit));

        return {
            data: data || [],
            pagination: {
            page,
            limit,
            total,
            totalPages,
            },
        };
    }

    static async getMyAppointments({ user, status }) {
        if (!user?.id) throw new Error("Unauthorized");

        // console.log(user)
        let q = supabase
            .from("appointment")
            .select(`
            id,
            tanggal,
            jam_mulai,
            jam_selesai,
            status,
            id_mahasiswa,
            id_konselor
            `)
            .order("tanggal", { ascending: true })
            .order("jam_mulai", { ascending: true });

        // role-based filter
        if (user.type === "mahasiswa") {
            q = q.eq("id_mahasiswa", user.id);
        } else if (user.type === "konselor") {
            q = q.eq("id_konselor", user.id);
        } else {
            throw new Error("Role tidak valid");
        }

        if (status) q = q.eq("status", status);

        const { data, error } = await q;
        if (error) throw error;

        return data || [];
    }

}
