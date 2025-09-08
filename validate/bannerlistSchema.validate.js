const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");


//Reset password
function bannerlistSchema(req, res, next) {
    const schema = Joi.object({
        type: Joi.string().required(),
        device: Joi.string().optional(),
    });
    validateRequest(req, res, next, schema);
}
module.exports = bannerlistSchema;