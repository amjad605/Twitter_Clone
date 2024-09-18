import Users from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import { v2 as cloudinary } from "cloudinary";
import { validateNewPassword } from "../utils/validateUser.js";
export const getUsers = async (req, res) => {
  try {
    const users = await Users.find().select("-password");
    res.status(200).json({
      statusCode: 200,
      message: "Users retrieved successfully",
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getProfile = async (req, res) => {
  try {
    const user = await Users.findOne({ username: req.params.name }).select(
      "-password"
    );
    if (!user) {
      return res.status(404).json({ error: "No user found with this name" });
    }

    res.status(200).json({
      statusCode: 200,
      message: "profile retrieved successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const followUnfollowUser = async (req, res) => {
  try {
    const user = await Users.findById(req.params.id);
    const currentUser = await Users.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "No user found with this ID" });
    }
    if (user._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ error: "You can't follow yourself" });
    }
    const isFollowing = currentUser.following.includes(req.params.id);
    if (isFollowing) {
      await Users.findByIdAndUpdate(user._id, {
        $pull: { followers: currentUser._id },
      });
      await Users.findByIdAndUpdate(currentUser._id, {
        $pull: { following: user._id },
      });
      //TODO: send user id in the response
      res.status(200).json({
        statusCode: 200,
        message: `You have unfollowed ${user.username}`,
      });
    } else {
      await Users.findByIdAndUpdate(user._id, {
        $push: { followers: currentUser._id },
      });
      await Users.findByIdAndUpdate(currentUser._id, {
        $push: { following: user._id },
      });
      const notification = new Notification({
        from: currentUser._id,
        to: user._id,
        type: "follow",
      });
      notification.save();
      //TODO: send user id in the response
      res.status(200).json({
        statusCode: 200,
        message: `You are now following ${user.username}`,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUser = await Users.findById(req.user._id);

    const users = await Users.find({
      $and: [
        { _id: { $nin: currentUser.following } },
        { _id: { $ne: currentUser._id } },
      ],
    }).select("-password");

    res.status(200).json({
      statusCode: 200,
      message: "Suggested users retrieved successfully",
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const updateProfile = async (req, res) => {
  let { username, fullName, email, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileImage, coverImage } = req.body;
  const userId = req.user._id;
  try {
    let user = await Users.findById(userId);
    console.log(user.password);
    if (!user) {
      return res.status(404).json({
        message: "User not found!!",
      });
    }
    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res.status(400).json({
        error: "Please provide both the current password and the new password",
      });
    }
    if (newPassword && currentPassword) {
      let isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res.status(400).json({
          error: "Current password in incorrect! ",
        });
      let errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({
          error: errors.array()[0].msg,
        });
      let salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImage) {
      if (user.profileImage) {
        let publicId = user.profileImage.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      const uploadedProfile = await cloudinary.uploader.upload(profileImage);
      profileImage = uploadedProfile.secure_url;
    }
    if (coverImage) {
      if (user.coverImage) {
        let publicId = user.coverImage.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      const uploadedProfile = await cloudinary.uploader.upload(coverImage);
      coverImage = uploadedProfile.secure_url;
    }
    user.username = username || user.username;
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImage = profileImage || user.profileImage;
    user.coverImage = coverImage || user.coverImage;
    user = await user.save();
    user.password = undefined;
    return res.status(200).json({
      message: "User Updated Successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
