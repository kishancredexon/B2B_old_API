const Joi = require('joi');
const authorize = require("../middleware/authorize.middleware");
const  validateRequest  = require('../middleware/validate.middleware');



//Create User
function publishmatchlistSchema(req, res, next) {
    const schema = Joi.object({
        rstatus: Joi.number().required(),
       
    });
    validateRequest(req,res, next, schema);
}

module.exports = publishmatchlistSchema;