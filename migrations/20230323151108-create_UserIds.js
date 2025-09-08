'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('UserIds', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userid: {
        type: Sequelize.INTEGER
      },
      birthdate: {
        type: Sequelize.DATE
      },
      name_first: {
        type: Sequelize.STRING
      },
      name_middle: {
        type: Sequelize.STRING
      },
      name_last: {
        type: Sequelize.STRING
      },
      address_city: {
        type: Sequelize.STRING
      },
      phone_number: {
        type: Sequelize.STRING
      },
      email_address: {
        type: Sequelize.STRING
      },
      address_street_1: {
        type: Sequelize.STRING
      },
      address_street_2: {
        type: Sequelize.STRING
      },
      selected_id_class: {
        type: Sequelize.STRING
      },
      address_postal_code: {
        type: Sequelize.STRING 
      },
      address_subdivision: {
        type: Sequelize.STRING
      },
      address_country_code: {
        type: Sequelize.STRING
      },
      identification_class: {
        type: Sequelize.STRING
      },
      current_government_id: {
        type: Sequelize.STRING
      },
      identification_number: {
        type: Sequelize.STRING
      },
      selected_country_code: {
        type: Sequelize.STRING
      },
      current_selfie: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('UserIds');
  }
};
