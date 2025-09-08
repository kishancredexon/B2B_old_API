'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transactions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({
      Transactionsdoc,
      User,
      Bonusbals
    }) {
      this.hasOne(Transactionsdoc, {
        as: 'transactions_doc',
        foreignKey: 'trans_id',
        targetKey: 'id'
      }),
        this.belongsTo(User, {
          as: 'user',
          foreignKey: 'userid'
        });
        this.belongsTo(Bonusbals, {
          as: 'bonus_bals',
          foreignKey: 'id',
          targetKey: 'transid'
        });
    }
  }
  Transactions.init({
    userid: DataTypes.INTEGER,
    amount: DataTypes.DECIMAL(10,2),
    txid: DataTypes.STRING,
    status: DataTypes.STRING,
    txdate: DataTypes.INTEGER,
    docid: DataTypes.INTEGER,
    ttype: DataTypes.STRING,
    atype: DataTypes.STRING,
    wit: DataTypes.STRING,
    prebal: DataTypes.DECIMAL(10,2),
    curbal: DataTypes.DECIMAL(10,2),
    jpoolid: DataTypes.STRING,
    gtype: DataTypes.STRING,
    order_id: DataTypes.STRING,
    trans_status: DataTypes.STRING,
    tid: DataTypes.INTEGER,
    bonusbal:DataTypes.DECIMAL(10,2),
    bnstring: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Transactions',
  });
  return Transactions;
};


// const Transaction = sequelize.define('Transaction', {
//   userid: Sequelize.INTEGER,
//   trans_status: Sequelize.STRING,
// });