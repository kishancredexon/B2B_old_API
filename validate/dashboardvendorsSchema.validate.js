const Joi = require('joi');
const  validateRequest  = require('../middleware/validate.middleware');
// const authorize = require("../middleware/authorize.middleware");

function dashbordVendorsDetailsSchema(req, res, next) {
    const schema = Joi.object({
        id: Joi.string().required(),
    })
    validateRequest(req,res, next, schema);
}
module.exports = dashbordVendorsDetailsSchema;

