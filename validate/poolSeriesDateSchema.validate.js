const Joi = require('joi');
const  validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");


//poolListViewSchema

function poolSeriesDateSchema(req, res, next) {
    const schema = Joi.object({
        contest_id: Joi.string().required(),
        date_start:Joi.string().required(),
        date_end:Joi.string().required(),
        matchid_start:Joi.number().required(),
        matchid_end:Joi.number().required(),
        gtype:Joi.string().required(),
        league_id:Joi.number().required(),
        session_id:Joi.number().required(),
    })
    validateRequest(req,res, next, schema);
}
module.exports = poolSeriesDateSchema;