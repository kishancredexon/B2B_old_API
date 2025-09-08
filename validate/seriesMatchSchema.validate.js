const Joi = require('joi');
const  validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function seriesMatchSchema(req, res, next) {
    const schema = Joi.object({
        cid: Joi.number().required(),
        type: Joi.string().required(),  //ckt, fb
    });
    validateRequest(req,res, next, schema);
}
module.exports=seriesMatchSchema;