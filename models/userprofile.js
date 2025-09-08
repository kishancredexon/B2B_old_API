'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Userprofile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Userprofile.init({
    userid: DataTypes.INTEGER,
    username: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    usertype: DataTypes.INTEGER,
    name: DataTypes.STRING,
    refercode: DataTypes.STRING,
    teamname: DataTypes.STRING,
    gender: DataTypes.STRING,
    dob: DataTypes.INTEGER,
    address: DataTypes.STRING,
    cityid: DataTypes.INTEGER,
    stateid: DataTypes.INTEGER,
    countryid: DataTypes.INTEGER,
    pincode: DataTypes.STRING,
    profilepic: DataTypes.STRING,
    status: DataTypes.SMALLINT,
    lat: DataTypes.DOUBLE,
    long: DataTypes.DOUBLE,
    persona_id: DataTypes.STRING,
    persona_status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Userprofile',
  });
  return Userprofile;
};

