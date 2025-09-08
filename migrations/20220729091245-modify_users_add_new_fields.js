'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'Users', // table name
        'referred_by', // new field name
        {
          type: Sequelize.STRING,
          after: 'refercode'
        },
      ),
      queryInterface.addColumn(
        'Users',
        'referred_status',
        {
          type: Sequelize.STRING,
          after: 'referred_by'
        },
      ),
     
    ])
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('Users', 'referred_by'),
      queryInterface.removeColumn('Users', 'referred_status'),
     
    ])
  }
};
