'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Useraadharcard extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Useraadharcard.init({
    userid: DataTypes.INTEGER,
    nameOnAadhar: DataTypes.STRING,
    adharNumber: DataTypes.INTEGER,
    adharfrontImage: DataTypes.STRING,
    adharbackImage: DataTypes.STRING,
    status: DataTypes.SMALLINT
  }, {
    sequelize,
    modelName: 'Useraadharcard',
  });
  return Useraadharcard;
};

//npx sequelize-cli migration:create --name modify_Usertype_add_new_fields

//npx sequelize-cli model:generate --name ContactUs --attributes name:string,email:string,message:text,subject:text