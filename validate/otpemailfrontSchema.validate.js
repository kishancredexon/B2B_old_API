const Joi = require('joi');
const  validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function otpemailfrontSchema(req, res, next) {
    const schema = Joi.object({ 
        email: Joi.string().required()
    });
    validateRequest(req,res, next, schema);
}

module.exports=otpemailfrontSchema;