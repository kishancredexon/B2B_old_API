const Joi = require('joi');
const formidable = require('formidable');
const validateAllFieldsRequests = require('../middleware/validateAllFieldsRequest.middleware');

function sureVerificationSchema(req, res, next) {
    console.log("req--->>",req.body)
   

    console.log("req body", req.body)
    var form = new formidable.IncomingForm();
    form.multiples = true;

     form.parse(req, async function (err, fields, files) {
        let schema = {};
        schema = Joi.object({
            type:Joi.string().required(),
            idno:Joi.string(),//.required(),
            //name: Joi.string(),//.required(),
            client_id: Joi.string(),//.required(),
            otp: Joi.string()//.required(),
        });
        req.files = files;
        req.body =  validateAllFieldsRequests(res, { "body": fields }, next, schema);
        console.log("req is",req.body)
        
            next()
        
    })
}
module.exports=sureVerificationSchema;