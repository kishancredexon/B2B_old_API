const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');

function updatecmsSchema(req, res, next) {
    const schema = Joi.object({
        title: Joi.string().required(),
        slug: Joi.string().required(),
        content: Joi.string().required(),
        cms_id: Joi.string().required(),
    });
    validateRequest(req, res, next, schema);
}

module.exports = updatecmsSchema;