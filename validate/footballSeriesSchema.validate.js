const Joi = require('joi');
const authorize = require("../middleware/authorize.middleware");
const  validateRequest  = require('../middleware/validate.middleware');



//Create User
function footballSeriesSchema(req, res, next) {
    const schema = Joi.object({
        status: Joi.string().required(),
       
    });
    validateRequest(req,res, next, schema);
}

module.exports = footballSeriesSchema;