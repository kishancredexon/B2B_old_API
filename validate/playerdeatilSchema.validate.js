const Joi = require('joi');
const  validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function playerdeatilSchema(req, res, next) {
    const schema = Joi.object({
        //type:Joi.string().required(),
        //match_id: Joi.number().required(),
        player_id: Joi.number().required(),
        type: Joi.string().required(),
        seasonId: Joi.string(),
        match_id: Joi.string(),
        league_id: Joi.number().optional()
    });
    validateRequest(req,res, next, schema);
}
module.exports=playerdeatilSchema;