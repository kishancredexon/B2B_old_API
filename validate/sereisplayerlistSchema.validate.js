const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');

function sereisplayerlistSchema(req, res, next) {
    const schema = Joi.object({
        type: Joi.string().required(),
        league_id: Joi.number().required(),
        contest_id: Joi.string().optional(),
    });
    validateRequest(req, res, next, schema);
}

module.exports = sereisplayerlistSchema;