import express from "express";
import { protect } from "../middleware/protect.js";
import {
  getNotifications,
  deleteAllNotifications,
} from "../controllers/notification.controller.js";
const router = express.Router();

router.get("/", protect, getNotifications);
router.delete("/", protect, deleteAllNotifications);
//router.delete("/:id", protect, deleteNotification);

export default router;
