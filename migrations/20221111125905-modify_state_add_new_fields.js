'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return await queryInterface.addColumn(
      'states', // table name
      'status', // new field name   0=unread credit 1 = read
      {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
    ) 
  },

  async down (queryInterface, Sequelize) {
    return await queryInterface.removeColumn('states', 'status')   
  }
};
