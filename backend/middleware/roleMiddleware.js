import userService from "../services/userService.js";

export const requireRole = (roles) => {
    return async (req, res, next) => {
        const data = await userService.getUser(req.user.id);

        if (!data || !roles.include(data.role)) {
            return res.status(403).json({ message: "Access denied"})
        };

        next();
    };
};