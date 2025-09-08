const Joi = require('joi');
const validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function joinPoolPrizeSchema(req, res, next) {
    const schema = Joi.object({
        pool_id: Joi.string().required(),
        user_id: Joi.string().required(),
    });
    validateRequest(req,res, next, schema);
}

module.exports=joinPoolPrizeSchema;