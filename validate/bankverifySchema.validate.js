const { model } = require("mongoose");
const Joi = require('joi');
const validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");
const validateAllFieldsRequests = require('../middleware/validateAllFieldsRequest.middleware');
const formidable = require('formidable');

function bankverifySchema(req, res, next) {
    console.log("req body", req.body)
    var form = new formidable.IncomingForm();
    form.multiples = true;

     form.parse(req, async function (err, fields, files) {
        let schema = {};
        schema = Joi.object({
                    userid: Joi.number().required(),
                    bankname: Joi.string().required(),
                    ifsccode: Joi.string().required(),
                    acholdername: Joi.string().required(),
                    acno: Joi.string().required(),
                    upi: Joi.string().optional(),
                    // image: Joi.string(),
    });
    req.files = files;
    req.body =  validateAllFieldsRequests(res, { "body": fields }, next, schema);
    console.log("req is",req.body)
    if (req.body.userid) {
        next()
    } 
})
    
}

module.exports = bankverifySchema;