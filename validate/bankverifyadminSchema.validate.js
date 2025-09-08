const { model } = require("mongoose");
const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

//Login
function bankverifyadminSchema(req, res, next) {
    const schema = Joi.object({
        userid: Joi.number().required(),
        isverified: Joi.number().required(),
        reject_reason: Joi.string().optional(),
    });
    validateRequest(req, res, next, schema);
}

module.exports = bankverifyadminSchema;