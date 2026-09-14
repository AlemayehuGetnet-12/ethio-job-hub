import User from "../models/User.js";

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id || req.user.id).select("-password -refreshToken");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password -refreshToken");
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password -refreshToken").sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

export default { getProfile, updateProfile, listUsers };
