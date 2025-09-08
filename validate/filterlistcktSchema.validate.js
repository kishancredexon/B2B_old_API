const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");


//authenticateSchema
function filterlistcktSchema(req, res, next) {
    const schema = Joi.object({
        match_id: Joi.number().required(),
    })
    validateRequest(req, res, next, schema);
}
module.exports = filterlistcktSchema;