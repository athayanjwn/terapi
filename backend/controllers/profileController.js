import ProfileService from "../services/profileService.js";

export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user?.id; // dari requireAuth kamu
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const updated = await ProfileService.updateMyProfile(userId, req.body);
    return res.status(200).json({ message: "Profile updated", profile: updated });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};
