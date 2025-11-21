import { supabase } from "../config/supabaseClient.js";

export const requireAuth = async (req, res, next) => {
    const token = req.cookies['access-token'];

    if (!token) return res.status(401).json({message:"Anda tidak memiliki akses"});

    const {data, error} = await supabase.auth.getUser(token);

    if (error || !data.user) return res.status(401).json({message:"Token tidak valid"});

    req.user = data.user;
    next();
};