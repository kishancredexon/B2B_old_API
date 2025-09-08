
const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");


//authenticateSchema
function authenticatefrontSchema(req, res, next) {
    const schema = Joi.object({
        usertype: Joi.number().required(),
        country_code: Joi.string().optional(),
        phone: Joi.string().allow('').optional(),
        password: Joi.string().allow('').optional(),
        email: Joi.string().allow('').optional(),
        socialid: Joi.string(),
        socialtype: Joi.number(),
        devicetype: Joi.string(),
        devicetoken: Joi.string(),
        lat: Joi.number().allow(null).optional(),
        long: Joi.number().allow(null).optional(),
        state_name:Joi.string().allow('').optional()
        // state_name: Joi.string().required().messages({
        //     "any.required": "please enable location permission in your browser/device"
        // })
    });
    validateRequest(req, res, next, schema);
}
module.exports = authenticatefrontSchema;