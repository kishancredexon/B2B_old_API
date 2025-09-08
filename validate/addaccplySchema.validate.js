const Joi = require('joi');
const  validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

// const teamDetail = Joi.object({
// 	team_id:Joi.number().required(),
// 	price:Joi.number().required(),
// 	quality:Joi.number().required()
// })

function plylistSchema(req, res, next) {
    const schema = Joi.object({
        match_id: Joi.number().required(),
        gametype: Joi.string().required(),
        gamekey: Joi.string().required(),
        data: Joi.array().items({
            pid:Joi.number().required(),
	        gkamount:Joi.number().required(),
	        sharecnt:Joi.number().required()
        }),
        isview:Joi.boolean().optional()
    });
    validateRequest(req,res, next, schema);
}
module.exports=plylistSchema;