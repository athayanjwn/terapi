import AppointmentService from "../services/appointmentService.js";
import userService from "../services/userService.js";

export const createAppointment = async (req, res) => {
  try {
    const appointment = await AppointmentService.create({
      id_mahasiswa: req.user.id,
      id_konselor: req.body.id_konselor,
      tanggal: req.body.tanggal,
      jam_mulai: req.body.jam_mulai,
      jam_selesai: req.body.jam_selesai,
    });

    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    await AppointmentService.cancel(req.params.id, req.user);
    res.json({ message: "Appointment dibatalkan" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const acceptAppointment = async (req, res) => {
  try {
    await AppointmentService.accept(req.params.id, req.user.id);
    res.json({ message: "Appointment diterima" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const rejectAppointment = async (req, res) => {
  try {
    await AppointmentService.reject(req.params.id, req.user.id);
    res.json({ message: "Appointment ditolak" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getJadwalPraktikKonselor = async (req, res) => {
  try {
    const data = await AppointmentService.getJadwalPraktikKonselor(
      req.params.id
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getBookedSlot = async (req, res) => {
  try {
    const data = await AppointmentService.getBookedSlot(
      req.params.id,
      req.query.tanggal
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllKonselor = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const result = await AppointmentService.getAllActive({ page, limit });

    // console.log(result)
    res.json(result); // { data: [...], pagination: {...} }
  } catch (err) {
    console.error("[GET /appointment] ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    console.log("[REQ]", {
  t: new Date().toISOString(),
  pid: process.pid,
  port: process.env.PORT,
  supabaseUrl: process.env.SUPABASE_URL,
});

    const status = req.query.status; // optional: PENDING, ACCEPTED, REJECTED, CANCELED
    const result = await AppointmentService.getMyAppointments({
      user: req.profile,
      status,
    });
    res.json(result);
  } catch (err) {
    console.error("[GET /appointment/my] ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
