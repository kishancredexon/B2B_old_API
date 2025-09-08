const Joi = require('joi');
const  validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

// const teamDetail = Joi.object({
// 	team_id:Joi.number().required(),
// 	price:Joi.number().required(),
// 	quality:Joi.number().required()
// })

function prizepoollistSchema(req, res, next) {
    const schema = Joi.object({
        match_id: Joi.number().required(),
        data: Joi.array().items({
            team_id:Joi.number().required(),
	        price:Joi.number().required(),
	        quality:Joi.number().required()
        }),
    });
    validateRequest(req,res, next, schema);
}
module.exports=prizepoollistSchema;