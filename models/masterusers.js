"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class masterusers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Userprofile }) {
      // define association here
      this.hasOne(Userprofile, {
        as: "user_profile",
        foreignKey: "userid",
        targetKey: "id",
      });
    }
  }
  masterusers.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      password: DataTypes.STRING,
      usertype: DataTypes.INTEGER, //0=admin 1=subadmin 2 =user
      apikey: DataTypes.STRING,
      dbname: DataTypes.STRING,
      deposit_api: DataTypes.STRING,
      wallet_check_api: DataTypes.STRING,
      apikeyofvendor: DataTypes.STRING,
      balance_api: DataTypes.STRING,
      logo_url: DataTypes.STRING,
      status: DataTypes.STRING,
      cricket: DataTypes.INTEGER,
      football: DataTypes.INTEGER,
      player_accumulator: DataTypes.INTEGER,
      player_contest: DataTypes.INTEGER,
      background_color: DataTypes.STRING,
      feature_box_bg: DataTypes.STRING,
      background_light: DataTypes.STRING,
      border_color: DataTypes.STRING,
      circle_color: DataTypes.STRING,
      contest_block_bg: DataTypes.STRING,
      faq_border: DataTypes.STRING,
      font_secondary: DataTypes.STRING,
      light_secondary_color: DataTypes.STRING,
      primary_color: DataTypes.STRING,
      progress_color: DataTypes.STRING,
      secondary_color: DataTypes.STRING,
      secondary_dark_color: DataTypes.STRING,
      table_header: DataTypes.STRING,
      input_bg: DataTypes.STRING,
      font_primary: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "masterusers",
    }
  );
  return masterusers;
};
