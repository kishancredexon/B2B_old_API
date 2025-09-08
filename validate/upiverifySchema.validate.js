const { model } = require("mongoose");
const Joi = require('joi');
const validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");
const validateAllFieldsRequests = require('../middleware/validateAllFieldsRequest.middleware');
const formidable = require('formidable');

function upiverifySchema(req, res, next) {
    console.log("req body", req.body)
    var form = new formidable.IncomingForm();
    form.multiples = true;

     form.parse(req, async function (err, fields, files) {
        let schema = {};
        schema = Joi.object({
                    userid: Joi.number().required(), 
                    upi: Joi.string().required(), 
    });
    req.files = files;
    req.body =  validateAllFieldsRequests(res, { "body": fields }, next, schema);
    console.log("req is",req.body)
    if (req.body.userid) {
        next()
    } 
})
    
}

module.exports = upiverifySchema;