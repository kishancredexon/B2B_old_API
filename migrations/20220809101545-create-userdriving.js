'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('userdrivings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      dr_name: {
        type: Sequelize.STRING
      },
      dr_dob: {
        type: Sequelize.INTEGER
      },
      dr_gender: {
        type: Sequelize.STRING
      },
      dr_number: {
        type: Sequelize.INTEGER
      },
      dr_expirydate: {
        type: Sequelize.INTEGER
      },
      dr_frontimage: {
        type: Sequelize.STRING
      },
      dr_backimage: {
        type: Sequelize.STRING
      },
      dr_status: {
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
    await queryInterface.dropTable('userdrivings');
  }
};