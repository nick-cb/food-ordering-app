import { DataTypes, Model } from "sequelize";
import Category from ".";
import { modelConfig, sequelize } from "../../db/config";
import Image from "../image";

const CategoryImage = sequelize.define(
  "CategoryImage",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    category_id: {
      type: DataTypes.BIGINT,
      references: {
        model: Category,
        key: "id",
      },
      field: "category_id",
    },
    image_id: {
      type: DataTypes.BIGINT,
      references: {
        model: Image,
        key: "id",
      },
      field: "image_id",
    },
  },
  modelConfig("category_image")
);

// CategoryImage.sync({ alter: true });
Category.belongsToMany(Image, {
  through: CategoryImage,
  onDelete: "cascade",
  as: "images",
});
Image.belongsToMany(Category, {
  through: CategoryImage,
  onDelete: "cascade",
});

export default CategoryImage;
