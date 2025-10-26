// backend/controllers/items.controller.js
import { validationResult } from "express-validator";
import { Item } from "../models/index.js";

// Obtenir tous les items
export async function getAllItems(req, res) {
  try {
    const items = await Item.findAll({
      where: { user_id: req.user.id }
    });
    return res.json(items);
  } catch (error) {
    console.error("Erreur getAllItems:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// Obtenir un item par ID
export async function getItemById(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Item non trouvé" });
    return res.json(item);
  } catch (error) {
    console.error("Erreur getItemById:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// Créer un nouvel item
export async function createItem(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    console.log("createItem - req.user:", req.user);
    console.log("createItem - req.body:", req.body);
    
    const { name, expirationDate, category } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }
    
    if (!expirationDate) {
      return res.status(400).json({ error: "Date d'expiration requise" });
    }
    
    const item = await Item.create({
      user_id: req.user.id,
      name,
      expiration_date: expirationDate,
      category
    });
    return res.status(201).json(item);
  } catch (error) {
    console.error("Erreur createItem:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// Mettre à jour un item
export async function updateItem(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Item non trouvé" });

    await item.update(req.body);
    return res.json(item);
  } catch (error) {
    console.error("Erreur updateItem:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

// Supprimer un item
export async function deleteItem(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Item non trouvé" });

    await item.destroy();
    return res.json({ message: "Item supprimé" });
  } catch (error) {
    console.error("Erreur deleteItem:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
