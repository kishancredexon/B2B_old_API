const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");
const Joi = require('joi');
function updatefaqSchema(req, res, next) {
    const schema = Joi.object({
        faq_id: Joi.string().required(),
        category_name: Joi.string(),
        question: Joi.string(),
        answer: Joi.string(),



    });
    validateRequest(req, res, next, schema);
}

module.exports = updatefaqSchema;