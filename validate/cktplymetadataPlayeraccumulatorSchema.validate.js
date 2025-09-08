const authorize = require("../middleware/authorize.middleware");
const formidable = require('formidable');
const validateAllFieldsRequests = require('../middleware/validateAllFieldsRequest.middleware');
const Joi = require('joi');

function cktplymetadataPlayeraccumulatorSchema(req, res, next) {
    console.log("req body", req.body)
    var form = new formidable.IncomingForm();
    form.multiples = true;

    form.parse(req, async function (err, fields, files) {
        let schema = {};
        schema = Joi.object({
            type:Joi.string().required(),
            pid: Joi.number().required(),
            logo_url: Joi.string(),
            jersy_no:Joi.number()

        });
        req.files = files;
        req.body = validateAllFieldsRequests(res, { "body": fields }, next, schema);
        console.log("req is", req.body)
        if (req.body.pid) {
            next()
        }
    })

}
module.exports = cktplymetadataPlayeraccumulatorSchema;
