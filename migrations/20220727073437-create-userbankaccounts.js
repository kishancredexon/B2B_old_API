'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Userbankaccounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userid: {
        type: Sequelize.INTEGER
      },
      bankname: {
        type: Sequelize.STRING
      },
      ifsccode: {
        type: Sequelize.STRING
      },
      acholdername: {
        type: Sequelize.STRING
      },
      acno: {
        type: Sequelize.STRING
      },
      isverified: {
        type: Sequelize.SMALLINT,
        defaultValue: 0
      },
      image: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING
      },
      state: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Userbankaccounts');
  }
};