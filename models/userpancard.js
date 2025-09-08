'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Userpancard extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Userpancard.init({
    userid: DataTypes.INTEGER,
    panname: DataTypes.STRING,
    doctype: DataTypes.STRING,
    pannumber: DataTypes.STRING,
    dob: DataTypes.INTEGER,
    panimage: DataTypes.STRING,
    isverified: DataTypes.SMALLINT
  }, {
    sequelize,
    modelName: 'Userpancard',
  });
  return Userpancard;
};