const Joi = require('joi');
const  validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");


//poolListViewSchema
function poolseriesdetailSchema(req, res, next) {
    const schema = Joi.object({
        league_id: Joi.number().required(),
        pool_id:Joi.string().required(),
    })
    validateRequest(req,res, next, schema);
}
module.exports = poolseriesdetailSchema;