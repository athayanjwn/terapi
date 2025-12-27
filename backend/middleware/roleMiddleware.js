import userService from "../services/userService.js";

export const requireRole = (roles) => (req, res, next) => {
  const allowed = Array.isArray(roles) ? roles : [roles];
  const role = req.profile?.role;
  const type = req.profile?.type;
  if ((!role || !allowed.includes(role)) & (!type || !allowed.includes(type))) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};
