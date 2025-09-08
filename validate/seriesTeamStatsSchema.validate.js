const Joi = require('joi');
const authorize = require("../middleware/authorize.middleware");
const  validateRequest  = require('../middleware/validate.middleware');



//Create User
function seriesTeamStatsSchema(req, res, next) {
    const schema = Joi.object({
        cid: Joi.number().required(),
        type: Joi.string().required(),
    });
    validateRequest(req,res, next, schema);
}

module.exports = seriesTeamStatsSchema;