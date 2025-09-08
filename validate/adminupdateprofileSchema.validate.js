const Joi = require('joi');
const validateAllFieldsRequests = require('../middleware/validateAllFieldsRequest.middleware');
const formidable = require('formidable');
function adminupdateprofileSchema(req, res, next) {

    var form = new formidable.IncomingForm();
    form.multiples = true;

    form.parse(req, async function (err, fields, files) {
        let schema = {};
        schema = Joi.object({
            name: Joi.string().required(),
            profilepic: Joi.string(),
        });
        req.files = files;
        req.body = validateAllFieldsRequests(res, { "body": fields }, next, schema);

        if (req.body.name) {
            next()
        }
    })
}

module.exports = adminupdateprofileSchema;