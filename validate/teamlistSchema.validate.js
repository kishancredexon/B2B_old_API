const Joi = require('joi');
const  validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function teamlistSchema(req, res, next) {
    const schema = Joi.object({
        type:Joi.string().required(),
        league_id: Joi.number().required(),
        
    });
    validateRequest(req,res, next, schema);
}
module.exports=teamlistSchema;