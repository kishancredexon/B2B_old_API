const Joi = require('joi');
const validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function verifyfrontSchema(req, res, next) {
    const schema = Joi.object({
        country_code: Joi.string().required(),
        phone: Joi.string().required(),
        otp: Joi.number().optional(),
        socialid: Joi.string().optional(),
        profilepic: Joi.string(),
       // usertype: Joi.number().optional(),
        name: Joi.string(),
        isVerifed: Joi.boolean().optional(),
        //profilepic: string().optional()
        ip: Joi.string().optional(),
        timezone: Joi.string().optional(),
        deviceId: Joi.string().optional(),
        rdevicetype: Joi.string().optional()
    });
    validateRequest(req,res, next, schema);
}

module.exports=verifyfrontSchema;