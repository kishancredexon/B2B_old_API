'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'Bonusbals', // table name
        'amount', 
        {
          type: Sequelize.FLOAT(2),
          defaultValue: 0.00 
        },
      ),
      queryInterface.addColumn(
        'Bonusbals', // table name
        'balamt', 
        {
          type: Sequelize.FLOAT(2),
          defaultValue: 0.00 
        },
      )
    ])
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
