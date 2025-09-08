const Joi = require('joi');
const  validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");


//authenticateSchema
function contestOrderSchema(req, res, next) {
     const schema = Joi.object({
        listData: Joi.string().required(), 
     })
    
    validateRequest(req,res, next, schema);
}
module.exports = contestOrderSchema;