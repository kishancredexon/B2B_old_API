'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'Userprofiles', // table name
        'persona_id', // new field name
        {
          type: Sequelize.STRING,
        
        },
      ),
      queryInterface.addColumn(
        'Userprofiles',
        'persona_status', {
          type: Sequelize.STRING,
        
        },
      ),

    ]);
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('Userprofiles', 'persona_id'),
      queryInterface.removeColumn('Userprofiles', 'persona_status'),


    ]);
  }
};
