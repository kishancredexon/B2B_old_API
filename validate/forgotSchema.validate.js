const Joi = require('joi');
const validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

// Forgot password
function forgotSchema(req, res, next) {
    const schema = Joi.object({
        phone: Joi.string().required()
    });
    validateRequest(req,res, next, schema);
}

module.exports=forgotSchema;