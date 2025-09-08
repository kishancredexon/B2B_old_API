'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserIds extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserIds.init({
    userid: DataTypes.INTEGER,
    birthdate: DataTypes.DATE,
    name_last: DataTypes.STRING,
    name_first: DataTypes.STRING,
    name_middle: DataTypes.STRING,
    address_city: DataTypes.STRING,
    phone_number: DataTypes.STRING,
    email_address: DataTypes.STRING,
    address_street_1: DataTypes.STRING,
    address_street_2: DataTypes.STRING,
    selected_id_class: DataTypes.STRING,
    address_postal_code: DataTypes.STRING,
    address_subdivision: DataTypes.STRING,
    address_country_code: DataTypes.STRING,
    identification_class: DataTypes.STRING,
    current_government_id: DataTypes.STRING,
    identification_number: DataTypes.STRING,
    selected_country_code: DataTypes.STRING,
    current_selfie: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'UserIds',
  });
  return UserIds;
};