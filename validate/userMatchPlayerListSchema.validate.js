const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function userMatchPlayerListSChema(req, res, next) {
    const schema = Joi.object({
        uteamid: Joi.string().required(),
        smtype:Joi.string().optional(),
        type:Joi.string().optional()
     });
    validateRequest(req, res, next, schema);
}
module.exports = userMatchPlayerListSChema;