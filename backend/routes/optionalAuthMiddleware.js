import { supabaseLogin } from "../config/supabaseClient.js";
import userService from "../services/userService.js";

export const optionalAuth = async (req, res, next) => {
  const token = req.cookies["access-token"];
  if (!token) return next();

  const { data, error } = await supabaseLogin.auth.getUser(token);
  if (error || !data.user) return next();

  const profile = await userService.getUser(data.user.id);
  req.user = data.user;
  req.profile = profile;
  next();
};
