const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');

function updatefantasySchema(req, res, next) {
    const schema = Joi.object({
        game_id: Joi.number().required(),
        type: Joi.string().required(),
        points: Joi.object().required()
    });
    validateRequest(req, res, next, schema);
}

module.exports = updatefantasySchema;