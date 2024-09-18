import express from "express";
import {
  createPost,
  getPosts,
  likeUnlikePost,
  commentOnPost,
  deletePost,
  getPostById,
  getLikedPosts,
  getFollowingPosts,
  getUserPosts,
} from "../controllers/post.controller.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

router.get("/", protect, getPosts);
router.get("/following", protect, getFollowingPosts);
router.get("/user/:name", protect, getUserPosts);
router.get("/liked/:id", protect, getLikedPosts);
router.get("/:id", protect, getPostById);
router.post("/create", protect, createPost);
router.post("/like/:id", protect, likeUnlikePost);
router.post("/comment/:id", protect, commentOnPost);
router.delete("/delete/:id", protect, deletePost);

export default router;
