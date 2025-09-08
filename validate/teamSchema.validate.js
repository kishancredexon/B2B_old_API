const Joi = require('joi');
const  validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function teamSchema(req, res, next) {
    const schema = Joi.object({
        match_id: Joi.number().required(),
        poolid: Joi.string().allow(null),
        type:Joi.string().required()
        
    });
    validateRequest(req,res, next, schema);
}
module.exports=teamSchema;