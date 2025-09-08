const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function substituteplayerupdateSchema(req, res, next) {
    const schema = Joi.object({
        league_id: Joi.number().required(),
        pid: Joi.array().required(),
        uteamid:Joi.string().required(),
        match_id:Joi.number().required(),
        contest_id:Joi.string().required(),
        type:Joi.string().required()
    });
    validateRequest(req, res, next, schema);
}
module.exports = substituteplayerupdateSchema;