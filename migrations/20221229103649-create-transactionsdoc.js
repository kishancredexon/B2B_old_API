'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transactionsdocs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      trans_id: {
        type: Sequelize.INTEGER
      },
      payment_id: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.INTEGER
      },
      currency: {
        type: Sequelize.STRING
      },
      order_id: {
        type: Sequelize.STRING
      },
      method: {
        type: Sequelize.STRING
      },
      vpa: {
        type: Sequelize.STRING
      },
      transaction_id: {
        type: Sequelize.STRING
      },
      created_at: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('Transactionsdocs');
  }
};