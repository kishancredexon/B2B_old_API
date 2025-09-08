const Joi = require('joi');
const  validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function teamProfileDetailSchema(req, res, next) {
    const schema = Joi.object({
        gametype: Joi.string().required(),
        team_id: Joi.number().required()
    });
    validateRequest(req,res, next, schema);
}
module.exports=teamProfileDetailSchema;