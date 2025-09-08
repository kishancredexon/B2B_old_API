'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Usertemp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Usertemp.init({
    country_code: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    otp: DataTypes.STRING,
    refercode: DataTypes.STRING,
    ip: DataTypes.STRING,
    password: DataTypes.STRING,
    socialid: DataTypes.STRING,
    logintype: DataTypes.STRING,
    referred_by: DataTypes.STRING,
    referred_status: DataTypes.STRING,
    devicetoken: DataTypes.STRING,
    devicetype: DataTypes.STRING,
    usertype: DataTypes.INTEGER,
    socialtype: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Usertemp',
  });
  return Usertemp;
};


