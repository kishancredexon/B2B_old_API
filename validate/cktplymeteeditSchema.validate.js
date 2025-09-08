const Joi = require('joi');
const authorize = require("../middleware/authorize.middleware");
const formidable = require('formidable');
const validateAllFieldsRequests = require('../middleware/validateAllFieldsRequest.middleware');



function cktplymetaeditSchema(req, res, next) {
    console.log("req body", req.body)
    var form = new formidable.IncomingForm();
    form.multiples = true;

    form.parse(req, async function (err, fields, files) {
        let schema = {};
        schema = Joi.object({
            cktmeta_id: Joi.string().required(),
            logo_url: Joi.string(),
            pid: Joi.number()

        });
        req.files = files;
        req.body = validateAllFieldsRequests(res, { "body": fields }, next, schema);
        console.log("req is", req.body)
        if (req.body.cktmeta_id) {
            next()
        }
    })

}
module.exports = cktplymetaeditSchema;

