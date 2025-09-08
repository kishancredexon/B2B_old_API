const Joi = require('joi');
const  validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");


//authenticateSchema
function socialloginSchema(req, res, next) {
    const schema = Joi.object({
        usertype: Joi.number().required(),
        country_code: Joi.string().optional(),
        phone:  Joi.string().optional(),
        password: Joi.string().allow('').optional(),
        email: Joi.string().allow('').optional(),
        socialid: Joi.string().required(),
        socialtype: Joi.number().required(),
        devicetype: Joi.string(),
        devicetoken: Joi.string(),
        lat: Joi.number(),
        long: Joi.number(),
        state_name:Joi.string().allow('').optional(),
        // state_name: Joi.string().required(),
        profilepic:  Joi.string()
    });
    validateRequest(req,res, next, schema);
}
module.exports=socialloginSchema;