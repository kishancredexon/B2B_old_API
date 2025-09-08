'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bonusbals extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Bonusbals.init({
    transid: DataTypes.INTEGER,
    userid: DataTypes.INTEGER,
    atype: DataTypes.STRING,
    expiry_date: DataTypes.INTEGER,
    txdate: DataTypes.INTEGER,
    amount: DataTypes.FLOAT,
    balamt: DataTypes.FLOAT,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Bonusbals',
  });
  return Bonusbals;
};