import AuthService from "../services/authService.js";
import userService from "../services/userService.js";

export const login = async (req, res) =>{
    try{
        const data = await AuthService.login(
            req.body.email,
            req.body.password
        );

        const user = await userService.getUser(
            data.id
        );

        res.cookie("access-token", data.access_token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
            maxAge: data.expires_in * 1000
        });;

        res.cookie("refresh-token", data.refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        })

        res.status(200).json({
            message: "Login Berhasil",
            user
        });
    }catch(error){
        res.status(401).json({message: error.message});
    }
};

export const refreshToken = async (req, res) => {
    try{
        const data = await AuthService.refreshToken(req.cookies['refresh-token']);

        res.cookie("access-token", data.access_token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
            maxAge: data.expires_in * 1000,
        });;

        res.cookie("refresh-token", data.refresh_token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        })

        res.json({ message: "Token refreshed" });
    }catch (err) {
        res.status(401).json({message: err.message});
    }
}

export const logout = async (req, res) => {
    try{
        res.clearCookie("access-token", { path: "/" });
        res.clearCookie("refresh-token", { path: "/" });

        res.json({message: "Logout Berhasil"})
    }catch(err){
        res.status(401).json({message: err.message});
    }
}

export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "Semua field wajib diisi." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password minimal 8 karakter." });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Konfirmasi password tidak sama." });
    }

    const data = await AuthService.register(name, email, password);

    return res.status(201).json({
      message: "Registrasi berhasil. Silakan cek email institusi untuk verifikasi.",
      userId: data.id,
      email: data.email,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email wajib diisi." });

    await AuthService.resendVerification(email);

    return res.json({ message: "Email verifikasi dikirim ulang. Silakan cek inbox/spam." });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};