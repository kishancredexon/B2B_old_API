const Joi = require('joi');
const validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");


//authenticateSchema
function contestViewSchema(req, res, next) {
    const schema = Joi.object({
        contest_id: Joi.string().required()
        // title: Joi.string().required(),
 })
    validateRequest(req,res, next, schema);
}
module.exports = contestViewSchema;