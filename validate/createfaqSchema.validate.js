const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");

function createfaqSchema(req, res, next) {
    const schema = Joi.object({
        faq_id: Joi.string(),
        category_name: Joi.string().required(),
        question: Joi.string().required(),
        answer: Joi.string().required(),



    });
    validateRequest(req, res, next, schema);
}

module.exports = createfaqSchema;