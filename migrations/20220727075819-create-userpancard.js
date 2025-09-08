'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Userpancards', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userid: {
        type: Sequelize.INTEGER
      },
      panname: {
        type: Sequelize.STRING
      },
      doctype: {
        type: Sequelize.STRING
      },
      pannumber: {
        type: Sequelize.STRING
      },
      dob: {
        type: Sequelize.INTEGER
      },
      panimage: {
        type: Sequelize.STRING
      },
      isverified: {
        type: Sequelize.SMALLINT,
        defaultValue: 0
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
    await queryInterface.dropTable('Userpancards');
  }
};