import express from "express";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import dotenv from "dotenv";
import connectMongoDB from "./db/connectMongodb.js";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import notificationRoutes from "./routes/notification.routes.js";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import path, { dirname, join } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve();

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const app = express();

const swaggerDocument = JSON.parse(
  fs.readFileSync(join(__dirname, "swagger.json"), "utf8")
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
const PORT = process.env.PORT || 5000;
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  connectMongoDB();
});
