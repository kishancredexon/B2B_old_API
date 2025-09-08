const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");


//authenticateSchema
function poolContestListSchema(req, res, next) {
    const schema = Joi.object({
        match_id: Joi.number().required(),
        uptojoinmin: Joi.number(),
        uptojoinmax: Joi.number(),
        entrymax: Joi.number(),
        emtrymin: Joi.number(),
        prizepoolmax: Joi.number(),
        prizepoolmin: Joi.number(),
        gurantee: Joi.number(),
        contestType:Joi.string(),
        contestid:Joi.string(),
        isprivate:Joi.number(), 
    })
    validateRequest(req, res, next, schema);
}
module.exports = poolContestListSchema;