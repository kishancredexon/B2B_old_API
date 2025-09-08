const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');

function viewcmsSchema(req, res, next) {
    const schema = Joi.object({
        cms_id: Joi.string().required()
    });
    validateRequest(req, res, next, schema);
}

module.exports = viewcmsSchema;