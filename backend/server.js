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
import { dirname, join } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// const swaggerDefinition = {
//   openapi: "3.0.0",
//   info: {
//     title: "Your API Documentation",
//     version: "1.0.0",
//     description: "Documentation for your Express API",
//   },
//   servers: [
//     {
//       url: "http://localhost:3000/api",
//       description: "Development server",
//     },
//   ],
//   components: {
//     securitySchemes: {
//       bearerAuth: {
//         type: "http",
//         scheme: "bearer",
//         bearerFormat: "JWT",
//       },
//     },
//   },
//   security: [
//     {
//       bearerAuth: [],
//     },
//   ],
// };

// // Options for the swagger docs
// const options = {
//   swaggerDefinition,
//   apis: ["./backend/routes/*.js"], // Path to your route files
// };

// const swaggerSpec = swaggerJsdoc(options);

// Use Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
const PORT = process.env.PORT || 5000;
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  connectMongoDB();
});
