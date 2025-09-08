const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");


//authenticateSchema
function poolwithActiveMatchSchema(req, res, next) {
    const schema = Joi.object({
        match_id: Joi.number(), 
        type : Joi.string(),
        countrytype : Joi.string(),
        // contest_id : Joi.string(),
        gtype : Joi.string(),
        contest_id : Joi.string(),
    })
    validateRequest(req, res, next, schema);
}
module.exports = poolwithActiveMatchSchema;