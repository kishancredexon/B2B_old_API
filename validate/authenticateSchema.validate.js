const { model } = require("mongoose");
const Joi = require('joi');
const  validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

//Login
function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req,res, next, schema);
}

module.exports=authenticateSchema;