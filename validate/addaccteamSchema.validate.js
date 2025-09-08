const Joi = require('joi');
const  validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

// const teamDetail = Joi.object({
// 	team_id:Joi.number().required(),
// 	price:Joi.number().required(),
// 	quality:Joi.number().required()
// })

function teamlistSchema(req, res, next) {
    const schema = Joi.object({
        league_id: Joi.number().required(),
        gametype: Joi.string().required(),
        gamekey: Joi.string().required(),
        data: Joi.array().items({
            team_id:Joi.number().required(),
	        pamount:Joi.number().required(),
	        sharecnt:Joi.number().required()
        }),
    });
    validateRequest(req,res, next, schema);
}
module.exports=teamlistSchema;