const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function registerSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().allow('').optional(),
        phone: Joi.string().min(8).max(12).required(),
        password: Joi.string().allow('').optional(),
        country_code: Joi.string().required(),
        usertype: Joi.number().required(),
        logintype: Joi.string().required(),
        socialid: Joi.string().allow('').optional(),
        socialtype: Joi.number(),
        referral: Joi.string().allow('').optional(),
        referred_by: Joi.string().allow('').optional(),
        devicetype: Joi.string().allow('').optional(),
        devicetoken: Joi.string().allow('').optional(),
        lat: Joi.number(),
        long: Joi.number(),
        state_name:Joi.string().allow('').optional(),
        // state_name: Joi.string().required().messages({
        //     "any.required": "please enable location permission in your browser/device"
        // })
    });
    validateRequest(req, res, next, schema);
}
module.exports = registerSchema;