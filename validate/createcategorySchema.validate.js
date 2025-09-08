const authorize = require("../middleware/authorize.middleware");
const formidable = require('formidable');
const validateAllFieldsRequests = require('../middleware/validateAllFieldsRequest.middleware');
const Joi = require('joi');


function createcategorySchema(req, res, next) {
    console.log("req body", req.body)
    var form = new formidable.IncomingForm();
    form.multiples = true;

    form.parse(req, async function (err, fields, files) {
        let schema = {};
        schema = Joi.object({
            name:Joi.string().required(),
            description: Joi.string(),
            image: Joi.string(),
            status:Joi.number()

        });
        req.files = files;
        req.body = validateAllFieldsRequests(res, { "body": fields }, next, schema);
        console.log("req is", req.body)
        if (req.body.name) {
            next()
        }
    })

}
module.exports = createcategorySchema;
