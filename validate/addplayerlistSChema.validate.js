const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function addplayerlistSChema(req, res, next) {
    const schema = Joi.object({
        type: Joi.string().required(),
        match_id: Joi.number().required(),
        pid: Joi.array().required(),
        //teama_count: Joi.number().required(),
        //teamb_count: Joi.number().required(),
        team_count:Joi.object().required(),//Inmobilealso
        player_role_count:Joi.object().required(),//Inmobilealso
        //team_no: Joi.number().required()
    });
    validateRequest(req, res, next, schema);
}
module.exports = addplayerlistSChema;