const Joi = require("joi");
const validateRequest = require("../middleware/validate.middleware");
const authorize = require("../middleware/authorize.middleware");

//authenticateSchema
function activeinactiveSchema(req, res, next) {
  const schema = Joi.object({
    id: Joi.string().required(),
    status: Joi.number().required(),
  });
  validateRequest(req, res, next, schema);
}
module.exports = activeinactiveSchema;
