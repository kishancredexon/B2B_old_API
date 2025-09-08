const authorize = require("../middleware/authorize.middleware");
const formidable = require('formidable');
const validateAllFieldsRequests = require('../middleware/validateAllFieldsRequest.middleware');
const Joi = require('joi');


function teammetadataSchema(req, res, next) {
   
    var form = new formidable.IncomingForm();
    form.multiples = true;

    form.parse(req, async function (err, fields, files) {
        let schema = {};
        schema = Joi.object({
            type:Joi.string().required(),
            team_id: Joi.number().required(),
            logo_url: Joi.string(),
            short_name:Joi.string()

        });
        req.files = files;
        req.body = validateAllFieldsRequests(res, { "body": fields }, next, schema);
      
        if (req.body.team_id) {
            next()
        }
    })

}
module.exports = teammetadataSchema;

