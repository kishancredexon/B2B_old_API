const Joi = require('joi');
const authorize = require("../middleware/authorize.middleware");
const  validateRequest  = require('../middleware/validate.middleware');



//Create User
function seriesmanagercktSchema(req, res, next) {
    const schema = Joi.object({
        name: Joi.string(),
       
    });
    validateRequest(req,res, next, schema);
}

module.exports = seriesmanagercktSchema;