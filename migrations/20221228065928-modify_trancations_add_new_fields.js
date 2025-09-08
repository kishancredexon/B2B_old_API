'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return await queryInterface.addColumn(
      'Transactions', // table name
      'jpoolid', // new field name   0=unread credit 1 = read
      {
        type: Sequelize.STRING,
        
      },
    ) 
  },

  async down (queryInterface, Sequelize) {
    return await queryInterface.removeColumn('Transactions', 'jpoolid')
  }
};


