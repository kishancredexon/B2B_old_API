const Joi = require('joi');
const  validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");


//Reset password
function resetfrontSchema(req, res, next) {
    const schema = Joi.object({
        password: Joi.string().min(6).required()
    });
    validateRequest(req,res, next, schema);
}
module.exports=resetfrontSchema;