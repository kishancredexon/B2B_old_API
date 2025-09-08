
const Joi = require('joi');


const authorize = require("../middleware/authorize.middleware");
const formidable = require('formidable');
const validateAllFieldsRequests = require('../middleware/validateAllFieldsRequest.middleware');



function contetsupdateSchema(req, res, next) {
    console.log("req body", req.body)
    var form = new formidable.IncomingForm();
    form.multiples = true;

    form.parse(req, async function (err, fields, files) {
        let schema = {};
        schema = Joi.object({
            contest_id: Joi.string().required(),
            title: Joi.string(),
            subtitle: Joi.string(),
            contestlogo: Joi.string(),
            dis_val: Joi.number(),
        });
        req.files = files;
        req.body = validateAllFieldsRequests(res, { "body": fields }, next, schema);
        console.log("req is", req.body)
        if (req.body.title) {
            next()
        }
    })

}
module.exports = contetsupdateSchema;


