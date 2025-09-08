'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Useraadharcards', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nameOnAadhar: {
        type: Sequelize.STRING
      },
      adharNumber: {
        type: Sequelize.INTEGER
      },
      adharfrontImage: {
        type: Sequelize.STRING
      },
      adharbackImage: {
        type: Sequelize.STRING
      },
      status: {
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
    await queryInterface.dropTable('Useraadharcards');
  }
};