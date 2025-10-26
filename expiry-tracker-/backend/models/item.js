import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Item = sequelize.define(
  "Item",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING(255), allowNull: false },
    expiration_date: { type: DataTypes.DATEONLY, allowNull: false },
    category: { type: DataTypes.STRING(50) },
  },
  {
    tableName: "items",
    timestamps: true,
    createdAt: "added_at",
    updatedAt: false,
  }
);

export default Item;
