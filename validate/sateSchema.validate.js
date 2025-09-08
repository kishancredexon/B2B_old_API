const Joi = require('joi');
const  validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function sateSchema(req, res, next) {
    const schema = Joi.object({
        country: Joi.string().required(),
    });
    validateRequest(req,res, next, schema);
}

module.exports=sateSchema;