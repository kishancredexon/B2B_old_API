const Joi = require('joi');
const  validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

// const teamDetail = Joi.object({
// 	team_id:Joi.number().required(),
// 	price:Joi.number().required(),
// 	quality:Joi.number().required()
// })

function notificationCreateSchema(req, res, next) {
    const schema = Joi.object({
        userids: Joi.array().required(),
        enddate: Joi.date().allow(""),
        isexpire: Joi.number().required(),
        type: Joi.string().required(),
        body: Joi.string().required(),
        isadmin: Joi.number(),
        title:Joi.string().required()
    });
    validateRequest(req,res, next, schema);
}
module.exports=notificationCreateSchema;