const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function substituteplayeraddSchema(req, res, next) {
    const schema = Joi.object({
        type: Joi.string().required(),
        league_id: Joi.number().required(),
        pid: Joi.array().required(),
        is_substitue: Joi.number().required(),
        team_count: Joi.object(),
        team_no: Joi.number(),
        uteamid:Joi.string().required()
    });
    validateRequest(req, res, next, schema);
}
module.exports = substituteplayeraddSchema;