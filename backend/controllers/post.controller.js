import { v2 as cloudinary } from "cloudinary";
import Post from "../models/post.model.js";
import Users from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import post from "../models/post.model.js";
import mongoose from "mongoose";
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    if (posts.length === 0) {
      return res.status(200).json({ posts: [] });
    }
    res.status(200).json({
      statusCode: 200,
      message: "Posts retrieved successfully",
      posts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const createPost = async (req, res) => {
  try {
    let { text, img } = req.body;
    if (!text && !img) {
      return res.status(400).json({
        message: "Text or image is required",
      });
    }
    const user = await Users.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (img) {
      let uploadedImg = await cloudinary.uploader.upload(img);
      img = uploadedImg.secure_url;
    }
    const post = new Post({
      user: req.user._id,
      text,
      img,
    });
    await post.save();
    res.status(201).json({
      statusCode: 201,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this post" });
    }
    if (post.img) {
      const imgId = post.img.split("/").slice(-1)[0].split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }
    post.comments.push({
      user: req.user._id,
      text,
    });
    await post.save();
    res.status(200).json({
      message: "Comment added successfully",
      post,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const likeUnlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    if (!postId) {
      return res.status(400).json({ message: "Post ID is required" });
    }
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      await post.updateOne({ $pull: { likes: userId } });

      await Users.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      const updatedLikes = post.likes.filter((id) => id.toString() !== userId);
      res.status(200).json({ updatedLikes });
    } else {
      post.likes.push(userId);
      await Users.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();
      const notification = new Notification({
        from: userId,
        to: post.user,

        type: "like",
      });
      await notification.save();
      const updatedLikes = post.likes;
      res.status(200).json({ updatedLikes });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId)
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({ path: "comments.user", select: "-password" });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res
      .status(200)
      .json({ statusCode: 200, message: "post retrieved successfully", post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getLikedPosts = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    if (likedPosts.length === 0) {
      return res
        .status(200)
        .json({ message: "No liked posts found", posts: [] });
    }
    res.status(200).json({
      statusCode: 200,
      message: "Liked posts retrieved successfully",
      posts: likedPosts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFollowingPosts = async (req, res) => {
  const user = await Users.findById(req.user._id);
  try {
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const posts = await Post.find({ user: { $in: user.following } })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    if (posts.length === 0) {
      return res.status(200).json({ message: "No posts found", posts: [] });
    }
    res.status(200).json({
      statusCode: 200,
      message: "Following posts retrieved successfully",
      posts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getUserPosts = async (req, res) => {
  const username = req.params.name;
  try {
    const user = await Users.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const posts = await Post.find({ user: user._id })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    if (posts.length === 0) {
      return res.status(200).json({ message: "No posts found", posts: [] });
    }
    res.status(200).json({
      statusCode: 200,
      message: "User posts retrieved successfully",
      posts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
