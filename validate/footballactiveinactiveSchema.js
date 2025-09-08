const Joi = require('joi');
const authorize = require("../middleware/authorize.middleware");
const  validateRequest  = require('../middleware/validate.middleware');



//Create User
function footballactiveinactiveSchema(req, res, next) {
    const schema = Joi.object({
        match_id: Joi.number().required(),
        is_active: Joi.number().required(),

    });
    validateRequest(req,res, next, schema);
}

module.exports = footballactiveinactiveSchema;