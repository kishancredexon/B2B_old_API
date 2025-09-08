const Joi = require('joi');
const  validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function otpfrontSchema(req, res, next) {
    const schema = Joi.object({
        country_code: Joi.string().required(),
        phone: Joi.string().required()
    });
    validateRequest(req,res, next, schema);
}

module.exports=otpfrontSchema;