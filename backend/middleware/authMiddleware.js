import { supabase } from "../config/supabaseClient.js";
import userService from "../services/userService.js";

export const requireAuth = async (req, res, next) => {
    console.log("cookie header:", req.headers.cookie);
    console.log("parsed token:", req.cookies?.["access-token"]);

    const token = req.cookies['access-token'];


    if (!token) return res.status(401).json({message:"Anda tidak memiliki akses"});

    const {data, error} = await supabase.auth.getUser(token);

    if (error || !data.user) return res.status(401).json({message:"Token tidak valid"});

    const user = await userService.getUser(data.user.id);

    req.user = data.user;
    req.profile = user;
    next();
};