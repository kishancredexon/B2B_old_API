const Joi = require('joi');
const  validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");


//poolListViewSchema
function pooldetailSchema(req, res, next) {
    const schema = Joi.object({
        match_id: Joi.number().required(),
        pool_id:Joi.string().required(),
        status:Joi.number().allow(null),
        userid:Joi.number().allow(null)
    })
    validateRequest(req,res, next, schema);
}
module.exports = pooldetailSchema;