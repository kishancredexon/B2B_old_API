'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transactionsdoc extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Transactionsdoc.init({
    trans_id: DataTypes.INTEGER,
    payment_id: DataTypes.STRING,
    amount: DataTypes.DECIMAL(10,2),
    currency: DataTypes.STRING,
    order_id: DataTypes.STRING,
    method: DataTypes.STRING,
    vpa: DataTypes.STRING,
    transaction_id: DataTypes.STRING,
    created_at: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Transactionsdoc',
  });
  return Transactionsdoc;
};