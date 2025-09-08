

const Joi = require('joi');
// const validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");
const validateAllFieldsRequests = require('../middleware/validateAllFieldsRequest.middleware');
const formidable = require('formidable');

function verificationSchema(req, res, next) {
    console.log("req body", req.body)
    var form = new formidable.IncomingForm();
    form.multiples = true;

     form.parse(req, async function (err, fields, files) {
        let schema = {};
        console.log("Fileds is",fields)
        if(!fields.type){
            schema = Joi.object({
            type: Joi.string().required(),

            });
        }
        
        if (fields.type =="Indian") {
            schema = Joi.object({
                userid: Joi.number().required(),
                type: Joi.string().required(),
                panimage: Joi.string().allow('').optional(),
                panname: Joi.string().required(),
                dob: Joi.string().required(),
                // adharfrontImage: Joi.string().required(),
                // adharbackImage: Joi.string().required(),
               
            });
        } else if (fields.type  == "British") {
            schema = Joi.object({
                userid: Joi.number().required(),
                type: Joi.string().required(),
                // pr_image: Joi.string().required(),
                // dr_frontimage: Joi.string().required(),
                // dr_backimage: Joi.string().required(),
            });
        }
    req.files = files;
    req.body =  validateAllFieldsRequests(res, { "body": fields }, next, schema);
    console.log("req is",req.body)
    if (req.body.userid) {
        next()
    } 
})  
}

module.exports = verificationSchema;