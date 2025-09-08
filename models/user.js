'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({
      Userprofile,
      Userbankaccounts,
      Transactions
    }) {

      // define association here
      this.hasOne(Transactions, {
        as: 'transactions',
        foreignKey: 'userid',
        targetKey: 'id'
      })
      this.hasOne(Userprofile, {
        as: 'user_profile',
        foreignKey: 'userid',
        targetKey: 'id'
      })
      this.hasOne(Userbankaccounts, {
        as: 'userbank_account',
        foreignKey: 'userid'
      });;
    }
  }
  User.init({
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    usertype: DataTypes.INTEGER,  //0=admin 1=subadmin 2 =user
    country_code: DataTypes.STRING,
    refercode: DataTypes.STRING,
    referred_by: DataTypes.STRING,
    referred_status: DataTypes.STRING,
    referalShareCount: DataTypes.INTEGER,
    otp: DataTypes.STRING,
    status: DataTypes.SMALLINT,
    ip: DataTypes.STRING,
    browser: DataTypes.STRING,
    devicetoken: DataTypes.STRING,
    devicetype: DataTypes.STRING,
    deviceId: DataTypes.STRING,
    rdevicetype: DataTypes.STRING,// register user device type
    logintype: DataTypes.STRING,
    socialid: DataTypes.STRING,
    walletbalance: DataTypes.DECIMAL(10,2),
    wltwin: DataTypes.DECIMAL(10,2),
    totalwin: DataTypes.DECIMAL(10,2),
    wltbns: DataTypes.DECIMAL(10,2),
    wltdept: DataTypes.DECIMAL(10,2),
    welbns: DataTypes.DECIMAL(10,2),
    logindate: DataTypes.INTEGER,
    isbankdverify: DataTypes.SMALLINT,
    upiverify: DataTypes.SMALLINT,
    ispanverify: DataTypes.SMALLINT,
    isphoneverify: DataTypes.SMALLINT,
    isemailverify: DataTypes.SMALLINT,
    istnameedit: DataTypes.SMALLINT,
    modified: DataTypes.INTEGER,
    isCompleteProfile: DataTypes.SMALLINT,
    isVerifed: DataTypes.SMALLINT,
    socialtype: DataTypes.INTEGER,
    referalShareCount: DataTypes.INTEGER,
    subadminmodule_status: DataTypes.TEXT,
    wltwithdraw: DataTypes.DECIMAL(10,2),
    totaljoinfee: DataTypes.DECIMAL(10,2),
    totaljoinfeedepots: DataTypes.DECIMAL(10,2),
    totaljoinfeewin: DataTypes.DECIMAL(10,2),
    isIds: DataTypes.SMALLINT,
    is_test: DataTypes.SMALLINT,
    totaltds: DataTypes.DECIMAL(10,2),
    wltbaltds: DataTypes.DECIMAL(10,2),
    emailOtp: DataTypes.STRING,
    gst: DataTypes.DECIMAL(10,2),
    isfirstdepo: DataTypes.SMALLINT
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};