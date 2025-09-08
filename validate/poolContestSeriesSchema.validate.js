const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");


//authenticateSchema
function poolContestSeriesSchema(req, res, next) {
    const schema = Joi.object({
        league_id: Joi.number().required(),
        status:Joi.string().optional(),
        contest_id:Joi.string().optional()
    })
    validateRequest(req, res, next, schema);
}
module.exports = poolContestSeriesSchema;