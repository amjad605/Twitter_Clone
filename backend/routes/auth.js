import express from "express";
import {
  login,
  logout,
  signup,
  getMe,
} from "../controllers/auth.controller.js";
import { validateSignup } from "../utils/validateUser.js";
import { protect } from "../middleware/protect.js";
import { get } from "mongoose";
const router = express.Router();
/**
 * @swagger
 * /me:
 *   get:
 *     summary: Get logged-in user's data
 *     description: Returns the data of the authenticated user. This route requires a valid JWT token.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: User's ID
 *                   example: 12345
 *                 email:
 *                   type: string
 *                   description: User's email
 *                   example: user@example.com
 *                 name:
 *                   type: string
 *                   description: User's name
 *                   example: John Doe
 *       401:
 *         description: Unauthorized, JWT token is missing or invalid
 */
router.get("/me", protect, getMe);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Logs in a user and returns a JWT token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Test1234*
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", login);

router.post("/logout", logout);

export default router;
