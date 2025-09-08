'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {

  return sequelize.define('DestinationModel', {
    // Define your destination model attributes here
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Add more attributes as needed
  });
};