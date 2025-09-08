const Joi = require('joi');
const validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function joinpoolseriesSchema(req, res, next) {
    const schema = Joi.object({
        poolid: Joi.string().required(),
        league_id: Joi.number().required(),
        // userid: Joi.number().required(),
        gametype: Joi.string().required(),
        uteamid: Joi.string().required(),
    });
    validateRequest(req,res, next, schema);
}

module.exports=joinpoolseriesSchema;