const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");
//authenticateSchema
function poolPrizeBreakSchema(req, res, next) {
    const schema = Joi.object({
        pool_prize_break_data: Joi.array()
        .items({
            poolmaster_id: Joi.string().required(),
            pmin:  Joi.number().required(),
            pmax: Joi.number().required(),
            pamount: Joi.number().required()
        }),
    })
    validateRequest(req,res, next, schema);
}
module.exports = poolPrizeBreakSchema;