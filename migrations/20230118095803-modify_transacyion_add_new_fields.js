'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return await queryInterface.addColumn(
      'Transactions', // table name
      'gtype', // new field name   0=unread credit 1 = read
      {
        type: Sequelize.STRING,
        
      },
    ) 
  },

  async down (queryInterface, Sequelize) {
    return await queryInterface.removeColumn('Transactions', 'gtype')
  }
};
