const Joi = require("joi");
const validateRequest = require("../middleware/validate.middleware");
const authorize = require("../middleware/authorize.middleware");

//Create User
function createUserSchema(req, res, next) {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    usertype: Joi.number().required(),
    // cricket: Joi.number().required(),
    // football: Joi.number().required(),
    // player_accumulator: Joi.number().required(),
    // player_contest: Joi.number().required(),
    country_code: Joi.string().required(),
    phone: Joi.string().required(),
    password: Joi.string().required(),
    logintype: Joi.string().required(),
    profilepic: Joi.string().allow("").optional(),
  });
  validateRequest(req, res, next, schema);
}

module.exports = createUserSchema;
