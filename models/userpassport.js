'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class userpassport extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  userpassport.init({
    userid: DataTypes.INTEGER,
    pr_name: DataTypes.STRING,
    pr_number: DataTypes.INTEGER,
    pr_expirydate: DataTypes.INTEGER,
    pr_countryid: DataTypes.INTEGER,
    pr_image: DataTypes.STRING,
    pr_status: DataTypes.SMALLINT
  }, {
    sequelize,
    modelName: 'userpassport',
  });
  return userpassport;
};
