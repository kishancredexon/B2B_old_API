const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");


//authenticateSchema
function seriesPrivatePoolSchema(req, res, next) {
    const schema = Joi.object({
        league_id: Joi.number().required(),
        privatename: Joi.string().required(),
        maxteams: Joi.number().required(),
        joinfee: Joi.number().required(),
        winners: Joi.number().required(),
        s: Joi.number().required(),
        m: Joi.number().required(),
        date_start: Joi.string().required(),
        date_end: Joi.string().required(),
        gtype: Joi.string().required(),
        totalwinamt: Joi.number().required(),
        poolpb: Joi.array()
            .items({
                pmin: Joi.number().required(),
                pmax: Joi.number().required(),
                pamount: Joi.number().required()
            }),
    })
    validateRequest(req, res, next, schema);
}
module.exports = seriesPrivatePoolSchema;