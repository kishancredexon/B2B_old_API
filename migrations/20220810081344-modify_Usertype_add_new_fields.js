'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return await queryInterface.addColumn(
      'Usertypes', // table name
      'userid', // new field name  
      {
        type: Sequelize.INTEGER,
        after: 'id'
      },
    )
  },

  async down (queryInterface, Sequelize) {
    return await queryInterface.removeColumn('Usertypes', 'userid')
  }
};
