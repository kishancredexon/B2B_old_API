const Joi = require('joi');
const  validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function verifyemailotpSchema(req, res, next) {
    const schema = Joi.object({ 
        email: Joi.string().required(),
        otp: Joi.number().required()
    });
    validateRequest(req,res, next, schema);
}

module.exports=verifyemailotpSchema;