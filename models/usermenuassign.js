'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Usermenuassign extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Usermenuassign.init({
    userid: DataTypes.INTEGER,
    menuid: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Usermenuassign',
  });
  return Usermenuassign;
};