'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return await queryInterface.addColumn(
      'Usertemps', // table name
      'socialtype', // new field name   1=google  2 = fb 3=apple 4=insta 5 =inkedein
      {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
    )  
  },

  async down (queryInterface, Sequelize) {
    return await queryInterface.removeColumn('Usertemps', 'socialtype')   
  }
};
