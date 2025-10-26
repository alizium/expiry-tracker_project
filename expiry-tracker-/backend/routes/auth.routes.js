// backend/routes/auth.routes.js
import express from "express";
import { body } from "express-validator";
import { register, login, getMe, logout, changePassword, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/register",
  body("name").notEmpty().isLength({ min: 3, max: 100 }),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("confirmPassword").optional(),
  register
);

router.post(
  "/login",
  body("identifier").notEmpty(),
  body("password").isString(),
  login
);

// Route pour vérifier l'authentification
router.get("/me", requireAuth, getMe);

// Route pour la déconnexion (optionnelle, côté client suffit)
router.post("/logout", logout);

// Route pour changer le mot de passe
router.post(
  "/change-password",
  requireAuth,
  body("currentPassword").notEmpty().withMessage("Mot de passe actuel requis"),
  body("newPassword").isLength({ min: 6 }).withMessage("Le nouveau mot de passe doit contenir au moins 6 caractères"),
  changePassword
);

// Route pour mot de passe oublié
router.post(
  "/forgot-password",
  body("email").isEmail().withMessage("Email valide requis"),
  forgotPassword
);

// Route pour réinitialiser le mot de passe
router.post(
  "/reset-password",
  body("token").notEmpty().withMessage("Token requis"),
  body("password").isLength({ min: 6 }).withMessage("Le mot de passe doit contenir au moins 6 caractères"),
  resetPassword
);

export default router;
