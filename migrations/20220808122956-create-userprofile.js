'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Userprofiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userid: {
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      usertype: {
        type: Sequelize.INTEGER
      },
      //pincode
      name: {
        type: Sequelize.STRING
      },
      refercode: {
        type: Sequelize.STRING
      },
      teamname: {
        type: Sequelize.STRING
      },
      gender: {
        type: Sequelize.STRING
      },
      dob: {
        type: Sequelize.INTEGER
      },
      address: {
        type: Sequelize.STRING
      },
      cityid: {
        type: Sequelize.INTEGER
      },
      stateid: {
        type: Sequelize.INTEGER
      },
      countryid: {
        type: Sequelize.INTEGER
      },
      pincode: {
        type: Sequelize.STRING
      },
      profilepic: {
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
    await queryInterface.dropTable('Userprofiles');
  }
};