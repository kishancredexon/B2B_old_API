'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Usertemps', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      country_code: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      otp: {
        type: Sequelize.STRING
      },
      refercode: {
        type: Sequelize.STRING
      },
      ip: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      socialid: {
        type: Sequelize.STRING
      },
      logintype: {
        type: Sequelize.STRING
      },
      country_code: {
        type: Sequelize.STRING
      },
      referred_by: {
        type: Sequelize.STRING
      },
      referred_status: {
        type: Sequelize.STRING
      },
      devicetoken: {
        type: Sequelize.STRING
      },
      devicetype: {
        type: Sequelize.STRING
      },
      usertype: {
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
    await queryInterface.dropTable('Usertemps');
  }
};