const Joi = require("joi");
const validateRequest = require("../middleware/validate.middleware");
const authorize = require("../middleware/authorize.middleware");

//authenticateSchema
function updateSchema(req, res, next) {
  const schema = Joi.object({
    userId: Joi.number().required(),
    status: Joi.number().required(),
  });
  validateRequest(req, res, next, schema);
}
module.exports = updateSchema;
