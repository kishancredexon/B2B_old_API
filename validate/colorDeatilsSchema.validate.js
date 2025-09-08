const Joi = require("joi");
const validateRequest = require("../middleware/validate.middleware");
const authorize = require("../middleware/authorize.middleware");

function colorDeatilsSchema(req, res, next) {
  const schema = Joi.object({
    userid: Joi.string().required(),
    // .messages({
    //     'number.base': `Please Send Userid`
    // }),
  });
  validateRequest(req, res, next, schema);
}

module.exports = colorDeatilsSchema;
