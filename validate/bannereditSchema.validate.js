const Joi = require('joi');


const authorize = require("../middleware/authorize.middleware");
const formidable = require('formidable');
const validateAllFieldsRequests = require('../middleware/validateAllFieldsRequest.middleware');



function bannereditSchema(req, res, next) {
    console.log("req body", req.body)
    var form = new formidable.IncomingForm();
    form.multiples = true;

    form.parse(req, async function (err, fields, files) {
        let schema = {};
        schema = Joi.object({
            banner_id: Joi.string().required(),
            type: Joi.string(),
            image: Joi.string(),
            sequence: Joi.number(),
            device: Joi.string(),
            status: Joi.number(),
            banner_link:Joi.string()
        });
        req.files = files;
        req.body = validateAllFieldsRequests(res, { "body": fields }, next, schema);
        console.log("req is", req.body)
        if (req.body.banner_id) {
            next()
        }
    })

}
module.exports = bannereditSchema;