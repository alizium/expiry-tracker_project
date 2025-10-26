import { sequelize } from "../config/db.js";
import User from './user.js';
import Item from './item.js';
import PasswordReset from './passwordReset.js';

// Associations
User.hasMany(Item, { foreignKey: "user_id", as: "items", onDelete: "CASCADE" });
Item.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasMany(PasswordReset, { foreignKey: "user_id", as: "passwordResets", onDelete: "CASCADE" });
PasswordReset.belongsTo(User, { foreignKey: "user_id", as: "user" });

export { sequelize, User, Item, PasswordReset };
