const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function editSeriesPlayerListSchema(req, res, next) {
    const schema = Joi.object({
        type: Joi.string().required(),
        uteamid: Joi.string().required(),
        league_id: Joi.number().required(),
        pid: Joi.array().required(),
        team_count: Joi.object().required(),
        is_substitue: Joi.number().required(),
        team_no: Joi.number().optional()

    });
    validateRequest(req, res, next, schema);
}
module.exports = editSeriesPlayerListSchema;