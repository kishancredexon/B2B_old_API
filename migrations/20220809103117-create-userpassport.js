'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('userpassports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pr_name: {
        type: Sequelize.STRING
      },
      pr_number: {
        type: Sequelize.INTEGER
      },
      pr_expirydate: {
        type: Sequelize.INTEGER
      },
      pr_countryid: {
        type: Sequelize.INTEGER
      },
      pr_image: {
        type: Sequelize.STRING
      },
      pr_status: {
        type: Sequelize.SMALLINT
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
    await queryInterface.dropTable('userpassports');
  }
};