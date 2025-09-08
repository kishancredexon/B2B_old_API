'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'Transactions', // table name
        'order_id', // new field name
        {
          type: Sequelize.STRING,
        
        },
      ),
      queryInterface.addColumn(
        'Transactions',
        'trans_status', {
          type: Sequelize.STRING,
        
        },
      ),

    ]);
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
