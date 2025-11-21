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
            secure: false,
            sameSite: "strict",
            path: "/",
            maxAge: data.expires_in * 1000
        });;

        res.cookie("refresh-token", data.refresh_token, {
            httpOnly: true,
            secur: false,
            sameSite: "strict",
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
            sameSite: "strict",
            path: "/",
            maxAge: data.expires_in * 1000,
        });;

        res.cookie("refresh-token", data.refresh_token, {
            httpOnly: true,
            secur: false,
            sameSite: "strict",
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
        const refreshToken = req.cookies['refresh-token'];

        await AuthService.logout(refreshToken);

        res.clearCookie("access_token", { path: "/" });
        res.clearCookie("refresh_token", { path: "/" });

        res.json({message: "Logout Berhasil"})
    }catch(err){
        res.status(401).json({message: err.message});
    }
}