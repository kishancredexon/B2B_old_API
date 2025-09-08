const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function completeprofileSchema(req, res, next) {
    const schema = Joi.object({
        name: Joi.string().required(),
        dob:  Joi.string().required(),
        gender: Joi.string().required(),
        address: Joi.string().required(),
        cityid: Joi.number().required(),
        stateid: Joi.number().required(),
        pincode:Joi.number().required(),

        // name: Joi.string().allow('').optional(),
        // dob: Joi.string().allow('').optional(),
        // gender: Joi.string().allow('').optional(),
        // address: Joi.string().allow('').optional(),
        // cityid: Joi.string().allow('').optional(),
        // stateid: Joi.string().allow('').optional(),
        // pincode: Joi.string().allow('').optional(),

    });
    validateRequest(req, res, next, schema);
}

module.exports = completeprofileSchema;


// npx sequelize-cli model:generate --name Userprofile --attributes userid:INTEGER,username:STRING,phone:STRING,email:STRING,password:STRING,usertype:INTEGER,name:STRING,refercode:STRING,teamname:STRING,gender:STRING,dob:INTEGER,address:STRING,cityid:INTEGER,stateid:INTEGER,countryid:INTEGER,pincode:STRING,profilepic:STRING,status:SMALLINT,
