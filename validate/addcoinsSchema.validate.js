const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function addcoinsSchema(req, res, next) {
    const schema = Joi.object({
        coins: Joi.number().required(),
    });
    validateRequest(req, res, next, schema);
}
module.exports = addcoinsSchema;