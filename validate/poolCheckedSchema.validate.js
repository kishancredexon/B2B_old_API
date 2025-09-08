const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");


//authenticateSchema
function poolCheckedSchema(req, res, next) {
    const schema = Joi.object({
        pool_id: Joi.string().required(),
        isChecked:Joi.number().required()
    })
    validateRequest(req, res, next, schema);
}
module.exports = poolCheckedSchema;