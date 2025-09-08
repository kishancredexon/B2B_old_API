const Joi = require('joi');
const  validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");


//authenticateSchema
function contestactiveSchema(req, res, next) {
    const schema = Joi.object({
        contest_id: Joi.string().required(),
        status: Joi.number().required()
    })
    validateRequest(req,res, next, schema);
}
module.exports = contestactiveSchema;