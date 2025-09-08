const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");


//authenticateSchema
function poolprizebreakdeleteSchema(req, res, next) {
    const schema = Joi.object({
        poolprizebreak_id: Joi.string().required()
    })
    validateRequest(req,res, next, schema);
}
module.exports = poolprizebreakdeleteSchema;