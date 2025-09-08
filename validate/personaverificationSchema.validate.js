const Joi = require('joi');
const  validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function personaverificationSchema(req, res, next) {
    const schema = Joi.object({
        persona_id:Joi.string().required(),
        persona_status: Joi.string().required(),
        id_data: Joi.object().required()
    });
    validateRequest(req,res, next, schema);
}
module.exports=personaverificationSchema;