const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");


//authenticateSchema
function privatePoolSchema(req, res, next) {
    const schema = Joi.object({
        match_id: Joi.number().required(),
        privatename: Joi.string().required(),
        maxteams: Joi.number().required(),
        joinfee: Joi.number().required(),
        winners: Joi.number().required(),
        s: Joi.number().required(),
        m: Joi.number().required(),
        totalwinamt: Joi.number().required(),
        gtype:Joi.string().required(),
        poolpb: Joi.array()
            .items({
                pmin: Joi.number().required(),
                pmax: Joi.number().required(),
                pamount: Joi.number().required()
            }),
    })
    validateRequest(req, res, next, schema);
}
module.exports = privatePoolSchema;