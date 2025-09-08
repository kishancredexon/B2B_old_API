const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function seriesaddplayerlistSchema(req, res, next) {
    const schema = Joi.object({
        type: Joi.string().required(),
        league_id: Joi.number().required(),
        pid: Joi.array().required(),
        is_substitue: Joi.number().required(),
        team_count: Joi.object(),
        team_no: Joi.number(),
        contest_id: Joi.string().optional(null)

    });
    validateRequest(req, res, next, schema);
}
module.exports = seriesaddplayerlistSchema;