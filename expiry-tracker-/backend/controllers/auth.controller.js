// backend/controllers/auth.controller.js

import { Op } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import * as db from "../models/index.js";

// Inscription
export async function register(req, res) {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Les mots de passe ne correspondent pas." });
    }

    const existingUser = await db.User.findOne({
      where: { [Op.or]: [{ email }, { name }] }
    });

    if (existingUser) {
      return res.status(409).json({ error: "Cet email ou nom est déjà utilisé." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.User.create({
      name,
      email,
      passwordHash: hashedPassword
    });

    const token = jwt.sign(
      { id: newUser.id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    return res.status(201).json({ token });
  } catch (err) {
    console.error("Erreur pendant l'inscription :", err);
    return res.status(500).json({ error: "Erreur serveur lors de l'inscription." });
  }
}

// Connexion
export async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: "Veuillez remplir tous les champs." });
    }

    const user = await db.User.findOne({
      where: {
        [Op.or]: [
          { email: identifier },
          { name: identifier }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Mot de passe incorrect." });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    return res.status(200).json({ token });
  } catch (err) {
    console.error("Erreur pendant la connexion :", err);
    return res.status(500).json({ error: "Erreur serveur lors de la connexion." });
  }
}

// Obtenir les informations de l'utilisateur connecté
export async function getMe(req, res) {
  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: { exclude: ['passwordHash'] }
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error("Erreur getMe :", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

// Déconnexion (côté serveur - optionnel)
export async function logout(req, res) {
  try {
    // Pour JWT, la déconnexion se fait côté client en supprimant le token
    // Ici on peut ajouter une blacklist de tokens si nécessaire
    return res.json({ message: "Déconnexion réussie." });
  } catch (err) {
    console.error("Erreur logout :", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

// Changer le mot de passe
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Mot de passe actuel et nouveau mot de passe requis." });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Le nouveau mot de passe doit contenir au moins 6 caractères." });
    }
    
    // Récupérer l'utilisateur avec le mot de passe hashé
    const user = await db.User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }
    
    // Vérifier le mot de passe actuel
    const bcrypt = await import('bcrypt');
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: "Mot de passe actuel incorrect." });
    }
    
    // Vérifier que le nouveau mot de passe est différent
    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      return res.status(400).json({ error: "Le nouveau mot de passe doit être différent de l'actuel." });
    }
    
    // Hasher le nouveau mot de passe
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // Mettre à jour le mot de passe
    await user.update({ passwordHash: newPasswordHash });
    
    return res.json({ message: "Mot de passe changé avec succès." });
  } catch (err) {
    console.error("Erreur changePassword :", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

// Configuration du transporteur email (Gmail)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'votre-email@gmail.com', // Remplacer par email Gmail
    pass: 'votre-mot-de-passe-app' // Remplacer par mdp d'application
  }
});

// Mot de passe oublié - Envoyer email de réinitialisation
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email requis." });
    }
    
    // Vérifier si l'utilisateur existe
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      // Pour le test, on affiche une erreur claire
      return res.status(404).json({ error: "Aucun compte trouvé avec cette adresse email." });
    }
    
    // Générer un token unique
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures
    
    // Supprimer les anciens tokens de réinitialisation
    await db.PasswordReset.destroy({ where: { user_id: user.id } });
    
    // Créer un nouveau token
    await db.PasswordReset.create({
      user_id: user.id,
      token,
      expires_at: expiresAt
    });
    
    // URL de réinitialisation
    const resetUrl = `${process.env.FRONTEND_URL || 'http://127.0.0.1:3001'}/reset-password.html?token=${token}`;
    
    // Contenu de l'email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@expiry-tracker.com',
      to: email,
      subject: 'Réinitialisation de votre mot de passe - Expiry Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f8f4e;">🔐 Réinitialisation de votre mot de passe</h2>
          <p>Bonjour ${user.name},</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Expiry Tracker.</p>
          <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #1f8f4e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p>Ou copiez ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p><strong>Ce lien expire dans 24 heures.</strong></p>
          <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">Expiry Tracker - Gestionnaire de documents</p>
        </div>
      `
    };
    
    // Envoyer l'email
    try {
      await transporter.sendMail(mailOptions);
      console.log("✅ Email envoyé avec succès à:", email);
    } catch (emailError) {
      console.error("❌ Erreur envoi email:", emailError);
      // On continue même si l'email échoue, pour ne pas bloquer l'utilisateur
      console.log("URL de réinitialisation (fallback):", resetUrl);
    }
    
    return res.json({ message: "Lien de réinitialisation envoyé avec succès !" });
  } catch (err) {
    console.error("Erreur forgotPassword :", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

// Réinitialiser le mot de passe avec token
export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ error: "Token et mot de passe requis." });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères." });
    }
    
    // Trouver le token de réinitialisation
    const passwordReset = await db.PasswordReset.findOne({
      where: { 
        token,
        used: false,
        expires_at: { [Op.gt]: new Date() }
      },
      include: [{ model: db.User, as: 'user' }]
    });
    
    if (!passwordReset) {
      return res.status(400).json({ error: "Token invalide ou expiré." });
    }
    
    // Hasher le nouveau mot de passe
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(password, saltRounds);
    
    // Mettre à jour le mot de passe de l'utilisateur
    await passwordReset.user.update({ passwordHash: newPasswordHash });
    
    // Marquer le token comme utilisé
    await passwordReset.update({ used: true });
    
    return res.json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (err) {
    console.error("Erreur resetPassword :", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}
