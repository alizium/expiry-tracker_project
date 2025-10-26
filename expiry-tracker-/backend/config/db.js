// backend/config/db.js

import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config(); // nécessaire si ce fichier est chargé avant server.js

const host = process.env.DB_HOST || "localhost";
const port = parseInt(process.env.DB_PORT || "5432", 10);
const name = process.env.DB_NAME || "expiry_tracker";
const user = process.env.DB_USER || "postgres";

// on cast toujours à string, même si vide
const pass = String(process.env.DB_PASS ?? "");

console.log("[DB CONFIG]", {
  host,
  port,
  name,
  user,
  passType: typeof pass,
  hasPass: pass.length > 0
});

export const sequelize = new Sequelize(name, user, pass, {
  host,
  port,
  dialect: "postgres",
  logging: false,
});
