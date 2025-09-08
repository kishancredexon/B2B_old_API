const Joi = require('joi');
const authorize = require("../middleware/authorize.middleware");
const  validateRequest  = require('../middleware/validate.middleware');



//Create User
function seriespublishSchema(req, res, next) {
    const schema = Joi.object({
        cid: Joi.number().required(),
        is_publish: Joi.number().required(),
       
    });
    validateRequest(req,res, next, schema);
}

module.exports = seriespublishSchema;