const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');

function transWithSchema(req, res, next) {
    const schema = Joi.object({
        transId: Joi.string().required(),
        type: Joi.string().required(),
        payoutTyp: Joi.number()
    });
    validateRequest(req, res, next, schema);
}

module.exports = transWithSchema;