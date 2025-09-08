
const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");


//authenticateSchema
function sendAppLinkSchema(req, res, next) {
    const schema = Joi.object({
        country_code: Joi.string().optional(),
        phone: Joi.string().allow('').optional(),
    });
    validateRequest(req, res, next, schema);
}
module.exports = sendAppLinkSchema;