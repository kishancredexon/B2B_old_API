const Joi = require("joi");
const validateRequest = require("../middleware/validate.middleware");
const authorize = require("../middleware/authorize.middleware");
const validateAllFieldsRequests = require("../middleware/validateAllFieldsRequest.middleware");
const formidable = require("formidable");

function vendorSchema(req, res, next) {
  var form = new formidable.IncomingForm();
  form.multiples = true;

  form.parse(req, async function (err, fields, files) {
    if (err) {
      return res.status(400).json({ error: "Error parsing the form" });
    }

    const schema = Joi.object({
      id: Joi.string().optional(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      name: Joi.string().required(),
      wallet_check_api: Joi.string().required(),
      deposit_api: Joi.string().required(),
      balance_api: Joi.string().required(),
      cricket: Joi.number().required(),
      football: Joi.number().required(),
      player_accumulator: Joi.number().required(),
      player_contest: Joi.number().required(),
      apikeyofvendor: Joi.string().required(),
      logo_url: Joi.string(),
    });
    req.files = files;
    req.body = validateAllFieldsRequests(res, { body: fields }, next, schema);
    console.log("req is", req.body);
    console.log("req files is", req.files);

    next();
  });
}

module.exports = vendorSchema;
