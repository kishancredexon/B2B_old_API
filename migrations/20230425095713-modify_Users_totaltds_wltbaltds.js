'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'Users', // table name
        'totaltds', // new field name
        {
          type: Sequelize.FLOAT,
          defaultValue: 0.00 
        },
      ),
      queryInterface.addColumn(
        'Users', // table name
        'wltbaltds', // new field name
        {
          type: Sequelize.FLOAT,
          defaultValue: 0.00 
        },
      )])
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
