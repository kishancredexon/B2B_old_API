'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'Users', // table name
        'isCompleteProfile', // new field name
        {
          type: Sequelize.SMALLINT,
          after: 'isphoneverify',
          defaultValue: 0,  //1=active 0= inactive
        },
      ),
      queryInterface.addColumn(
        'Users',
        'isVerifed', {
        type: Sequelize.SMALLINT,
        after: 'isCompleteProfile',
        defaultValue: 0,  //1=active 0= inactive
      },
      )
    ]); 
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('Users', 'isCompleteProfile'),
      queryInterface.removeColumn('Users', 'isVerifed'),
    ]); 
  }
};
