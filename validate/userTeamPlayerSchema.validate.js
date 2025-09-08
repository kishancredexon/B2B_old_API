const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");


//authenticateSchema
function userTeamPlayerSchema(req, res, next) {
    const schema = Joi.object({
        match_id: Joi.number().required(),
        uteamid:Joi.string().required(),
        gametype:Joi.string().required(),
        type:Joi.string().optional(),
        contest_id:Joi.string().optional(),
    })
    validateRequest(req, res, next, schema);
}
module.exports = userTeamPlayerSchema;