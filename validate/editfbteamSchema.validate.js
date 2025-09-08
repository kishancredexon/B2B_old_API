// const Joi = require('joi');
// const validateRequest = require('../middleware/validate.middleware');
// const authorize = require("../middleware/authorize.middleware");

// function editfbteamSchema(req, res, next) {
//     const schema = Joi.object({
//         team_id: Joi.number().required(),
//         logo_path: Joi.string().required(),
//         name: Joi.string().required(),
//         short_code: Joi.string().required(),


//     });
//     validateRequest(req, res, next, schema);
// }
// module.exports = editfbteamSchema;

const Joi = require('joi');


const authorize = require("../middleware/authorize.middleware");
const formidable = require('formidable');
const validateAllFieldsRequests = require('../middleware/validateAllFieldsRequest.middleware');



function editfbteamSchema(req, res, next) {
    console.log("req body", req.body)
    var form = new formidable.IncomingForm();
    form.multiples = true;

    form.parse(req, async function (err, fields, files) {
        let schema = {};
        schema = Joi.object({
            team_id: Joi.string().required(),
            logo_path: Joi.string(),
            short_code: Joi.string(),
        });
        req.files = files;
        req.body = validateAllFieldsRequests(res, { "body": fields }, next, schema);
        console.log("req is", req.body)
        if (req.body.team_id) {
            next()
        }
    })

}
module.exports = editfbteamSchema;

