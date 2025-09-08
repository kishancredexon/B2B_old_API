const Joi = require('joi');
const  validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");


//poolListViewSchema
function poolmasterlistSchema(req, res, next) {
    const schema = Joi.object({
        contest_id: Joi.string().required(),
        gtype: Joi.string().required(),
        type: Joi.string().required(),

      
    })
    validateRequest(req,res, next, schema);
}
module.exports = poolmasterlistSchema;