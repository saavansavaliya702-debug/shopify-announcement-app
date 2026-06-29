import 'dotenv/config';
import dns from 'dns';
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import announcementRoutes from "./routes/announcement.js";

dns.setServers(['8.8.8.8', '8.8.4.4']);
const PORT = process.env.PORT || 3000;

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set. Copy .env.example to .env and fill it in.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (req, res) => res.json({ status: "ok" }));

  app.use("/api", announcementRoutes);

  app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
