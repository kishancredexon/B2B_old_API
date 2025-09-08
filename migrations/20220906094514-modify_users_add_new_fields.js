'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'Userprofiles', // table name
        'lat', // new field name
        {
          type: Sequelize.DOUBLE,
          after: 'address'
        },
      ),
      queryInterface.addColumn(
        'Userprofiles',
        'long', {
        type: Sequelize.DOUBLE,
        after: 'lat'
      },
      )
    ]);
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('Userprofiles', 'lat'),
      queryInterface.removeColumn('Userprofiles', 'long'),
    ]);
  }
};
