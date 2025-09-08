
const Joi = require('joi');
const validateRequest = require('../middleware/validate.query.middleware');
const authorize = require("../middleware/authorize.middleware");


//authenticateSchema
function authenticatefrontCheckSchema(req, res, next) {
    const schema = Joi.object({
        //country_code: Joi.string(),
        userid: Joi.string().required(),
        apikey: Joi.string().required()
    });
    validateRequest(req, res, next, schema);
}
module.exports = authenticatefrontCheckSchema;