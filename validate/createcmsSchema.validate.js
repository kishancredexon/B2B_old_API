const Joi = require('joi');
const validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function createcmsSchema(req, res, next) {
    const schema = Joi.object({
        title: Joi.string().required(),
        slug: Joi.string().required(),
        content:Joi.string().required(),
      

    });
    validateRequest(req,res, next, schema);
}

module.exports=createcmsSchema;