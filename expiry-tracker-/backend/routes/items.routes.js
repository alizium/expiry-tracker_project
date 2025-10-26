// backend/routes/items.routes.js
import express from "express";
import { body, param } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} from "../controllers/items.controller.js";

const router = express.Router();

// GET /api/items
router.get("/", requireAuth, getAllItems);

// GET /api/items/:id
router.get("/:id", requireAuth, param("id").isInt(), getItemById);

// POST /api/items
router.post(
  "/",
  requireAuth,
  body("name").notEmpty().withMessage("Le nom est requis"),
  body("expirationDate").isISO8601().toDate(),
  createItem
);

// PUT /api/items/:id
router.put(
  "/:id",
  param("id").isInt(),
  body("name").optional().isString(),
  body("expirationDate").optional().isISO8601().toDate(),
  updateItem
);

// DELETE /api/items/:id
router.delete("/:id", param("id").isInt(), deleteItem);

export default router;
