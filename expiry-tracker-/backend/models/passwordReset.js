// backend/models/passwordReset.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const PasswordReset = sequelize.define("PasswordReset", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

export default PasswordReset;
