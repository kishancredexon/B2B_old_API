'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'Users', // table name
        'phone', // new field name
        {
          type: Sequelize.STRING,
          after: 'id'
        },
      ),
      queryInterface.addColumn(
        'Users',
        'email',
        {
          type: Sequelize.STRING,
          after: 'phone'
        },
      ),
      queryInterface.addColumn(
        'Users',
        'password',
        {
          type: Sequelize.STRING,
          after: 'email'
        },
      ),
      queryInterface.addColumn(
        'Users',
        'usertype',
        {
          type: Sequelize.INTEGER,
          after: 'password'
        },
      ),
      queryInterface.addColumn(
        'Users',
        'country_code',
        {
          type: Sequelize.STRING,
          after: 'usertype'
        },
      ),
      queryInterface.addColumn(
        'Users',
        'refercode',
        {
          type: Sequelize.STRING,
          after: 'country_code'
        },
      )
    ])
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('Users', 'phone'),
      queryInterface.removeColumn('Users', 'email'),
      queryInterface.removeColumn('Users', 'password'),
      queryInterface.removeColumn('Users', 'usertype'),
      queryInterface.removeColumn('Users', 'country_code'),
      queryInterface.removeColumn('Users', 'refercode')
    ])
  }
};
