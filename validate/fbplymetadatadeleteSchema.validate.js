const Joi = require('joi');
const authorize = require("../middleware/authorize.middleware");
const validateRequest = require('../middleware/validate.middleware');



//Create User
function fbplymetadatadeleteSchema(req, res, next) {
    const schema = Joi.object({
        pid: Joi.number().required(),
        status: Joi.number().required(),

    });
    validateRequest(req, res, next, schema);
}

module.exports = fbplymetadatadeleteSchema;