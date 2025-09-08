const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function cloneMatchPlayerListSChema(req, res, next) {
    const schema = Joi.object({
        uteamid: Joi.string().required(),
        team_no: Joi.number().required()
    });
    validateRequest(req, res, next, schema);
}
module.exports = cloneMatchPlayerListSChema;