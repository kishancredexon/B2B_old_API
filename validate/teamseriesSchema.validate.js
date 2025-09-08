const Joi = require('joi');
const  validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function teamseriesSchema(req, res, next) {
    const schema = Joi.object({
      league_id: Joi.number().required(),
      poolid: Joi.string().allow(null),
      contest_id: Joi.string().allow(null)
    });
    validateRequest(req,res, next, schema);
}
module.exports=teamseriesSchema;