'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      otp: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.SMALLINT,
        defaultValue: 1,
      },
      ip: {
        type: Sequelize.STRING
      },
      browser: {
        type: Sequelize.STRING
      },
      devicetoken: {
        type: Sequelize.STRING
      },
      devicetype: {
        type: Sequelize.STRING
      },
      logintype: {
        type: Sequelize.STRING,
        defaultValue: 1,
        comment:'N=Normal F=Facebook G=Google',
      },
      socialid: {
        type: Sequelize.STRING
      },
      walletbalance: {
        type: Sequelize.FLOAT,
        defaultValue: 0.00 
      },
      wltwin: {
        type: Sequelize.FLOAT,
        defaultValue: 0.00 
      },
      wltbns: {
        type: Sequelize.FLOAT,
        defaultValue: 0.00 
      },
      welbns: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      logindate: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      isbankdverify: {
        type: Sequelize.SMALLINT,
        defaultValue: 0
      },
      ispanverify: {
        type: Sequelize.SMALLINT,
        defaultValue: 0
      },
      isphoneverify: {
        type: Sequelize.SMALLINT,
        defaultValue: 0
      },
      isemailverify: {
        type: Sequelize.SMALLINT,
        defaultValue: 0
      },
      referalShareCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      istnameedit: {
        type: Sequelize.SMALLINT
      },
      modified: {
        type: Sequelize.INTEGER,
        defaultValue: 1
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
    await queryInterface.dropTable('Users');
  }
};