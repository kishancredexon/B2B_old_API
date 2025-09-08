const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function cloneSeriesPlayerListSChema(req, res, next) {
    const schema = Joi.object({
        uteamid: Joi.string().required()

    });
    validateRequest(req, res, next, schema);
}
module.exports = cloneSeriesPlayerListSChema;