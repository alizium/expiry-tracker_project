// backend/server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config(); // doit absolument être appelé avant d'accéder à process.env

import { sequelize } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import itemsRoutes from "./routes/items.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemsRoutes);

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    // Vérif environnement
    console.log("[ENV CHECK]", {
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER,
      DB_PASS_TYPE: typeof process.env.DB_PASS,
    });

    await sequelize.authenticate();
    console.log("✅ Connexion à la base de données établie !");
    await sequelize.sync({ alter: false });
    app.listen(PORT, () => {
      console.log(`🌐 Serveur lancé sur http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Échec de connexion à la base de données :", err.message);
    process.exit(1);
  }
})();
