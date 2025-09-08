'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return await queryInterface.addColumn(
      'Users', // table name
      'wltdept', // new field name
      {
        type: Sequelize.INTEGER,
        after: 'wltbns'
      },
    ) 
  },

  async down (queryInterface, Sequelize) {
    return await queryInterface.removeColumn('Users', 'wltdept')
    
      
  }
};
