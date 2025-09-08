const Joi = require('joi');
const validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function joinPoolSchema(req, res, next) {
    const schema = Joi.object({
        poolid: Joi.string().required(),
        match_id: Joi.number().required(),
        //userid: Joi.string().required(),
        gametype: Joi.string().required(),
        uteamid: Joi.string().required(),
    });
    validateRequest(req,res, next, schema);
}

module.exports=joinPoolSchema;