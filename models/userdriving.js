'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class userdriving extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  userdriving.init({
    userid: DataTypes.INTEGER,
    dr_name: DataTypes.STRING,
    dr_dob: DataTypes.INTEGER,
    dr_gender: DataTypes.STRING,
    dr_number: DataTypes.INTEGER,
    dr_expirydate: DataTypes.INTEGER,
    dr_frontimage: DataTypes.STRING,
    dr_backimage: DataTypes.STRING,
    dr_status: DataTypes.SMALLINT
  }, {
    sequelize,
    modelName: 'userdriving',
  });
  return userdriving;
};