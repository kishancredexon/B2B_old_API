'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Userbankaccounts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Userbankaccounts.init({
    userid: DataTypes.INTEGER,
    bankname: DataTypes.STRING,
    ifsccode: DataTypes.STRING,
    acholdername: DataTypes.STRING,
    acno: DataTypes.STRING,
    isverified: DataTypes.SMALLINT,
    image: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    upi: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Userbankaccounts',
  });
  return Userbankaccounts;
};