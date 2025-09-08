const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');

function sateEditSchema(req, res, next) {
    const schema = Joi.object({
        id: Joi.string().required(),
        status: Joi.number().required(),
    });
    validateRequest(req, res, next, schema);
}
module.exports = sateEditSchema;