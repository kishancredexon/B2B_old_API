const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function bannercreateSchema(req, res, next) {
    const schema = Joi.object({
        type: Joi.string().required(),
        image: Joi.string().required(),
        sequence: Joi.number().required(),
        status: Joi.number().required(),
        banner_link: Joi.string().required() 

    });
    validateRequest(req, res, next, schema);
}

module.exports = bannercreateSchema;