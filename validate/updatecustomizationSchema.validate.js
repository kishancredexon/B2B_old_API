const Joi = require("joi");
const validateRequest = require("../middleware/validate.middleware");
const authorize = require("../middleware/authorize.middleware");

//authenticateSchema
function updatecustomizationSchema(req, res, next) {
  console.log("req.body-->>",req.body)
  const schema = Joi.object({
    _id: Joi.string().required(),
    // football: Joi.number().required(),
    // cricket: Joi.number().required(),
    // player_accumulator: Joi.number().required(),
    // player_contest: Joi.number().required(),
    background_color: Joi.string().required(),
    feature_box_bg: Joi.string().required(),
    background_light: Joi.string().required(),
    border_color: Joi.string().required(),
    circle_color: Joi.string().required(),
    contest_block_bg: Joi.string().required(),
    dark_text: Joi.string().required(),
    faq_border: Joi.string().required(),
    font_secondary: Joi.string().required(),
    light_secondary_color: Joi.string().required(),
    primary_color: Joi.string().required(),
    progress_color: Joi.string().required(),
    secondary_color: Joi.string().required(),
    secondary_dark_color: Joi.string().required(),
    table_header: Joi.string().required(),
    input_bg: Joi.string().required(),
    font_primary: Joi.string().required(),
  });
  validateRequest(req, res, next, schema);
}
module.exports = updatecustomizationSchema;
