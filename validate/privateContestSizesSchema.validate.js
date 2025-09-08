const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");


//authenticateSchema
function privateContestSizeSchema(req, res, next) {
    const schema = Joi.object({
        contest_size: Joi.number().required(),
    })
    validateRequest(req, res, next, schema);
}
module.exports = privateContestSizeSchema;