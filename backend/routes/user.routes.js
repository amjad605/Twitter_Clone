import express from "express";
import Users from "../models/user.model.js";
import { get } from "mongoose";
import { protect } from "../middleware/protect.js";
import {
  followUnfollowUser,
  getProfile,
  getSuggestedUsers,
  getUsers,
  updateProfile,
} from "../controllers/user.controller.js";
import { validateNewPassword } from "../utils/validateUser.js";
const router = express.Router();
router.get("/", protect, getUsers);
router.get("/profile/:name", protect, getProfile);
router.get("/suggested", protect, getSuggestedUsers);
// router.get("/search", protect, searchUsers);
router.post("/follow/:id", protect, followUnfollowUser);
// router.get("/followers", protect, getFollowers);
// router.get("/following", protect, getFollowing);
// router.get("/notifications", protect, getNotifications);
// router.post("/notifications", protect, markNotificationsAsRead);
router.put("/update", protect, validateNewPassword, updateProfile);
export default router;
