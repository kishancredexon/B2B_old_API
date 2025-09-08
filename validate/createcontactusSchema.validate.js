const Joi = require('joi');
const  validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");


//authenticateSchema
function createcontactusSchema(req, res, next) {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
        message: Joi.string().required(),
        subject: Joi.string().required(),
        phone: Joi.string().required(),
    })
    validateRequest(req,res, next, schema);
}
module.exports = createcontactusSchema;