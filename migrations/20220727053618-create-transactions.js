'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userid: {
        type: Sequelize.INTEGER
      },
      amount: {
        type: Sequelize.FLOAT
      },
      txid: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      txdate: {
        type: Sequelize.INTEGER
      },
      docid: {
        type: Sequelize.INTEGER
      },
      ttype: {
        type: Sequelize.STRING,
        defaultValue: 'cr',
        comment:'cr=credit,db=debit'
      },
      atype: {
        type: Sequelize.STRING,
        comment:'addbal=new balance add\nwin=winning\nloss\ncjoin= contest join\nopbal= Opning Balance\nclbal= closing Balance\nwlcbns= Welcome Bonus\nrefbns= Refund Bonus\nntflpool= Not full pool persent\nwithdr= Withdrawal\n',
      },
      wit: {
        type: Sequelize.STRING,
        comment:'wltwin,wltbal,wltbns'
      },
      prebal: {
        type: Sequelize.FLOAT
      },
      curbal: {
        type: Sequelize.FLOAT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Transactions');
  }
};