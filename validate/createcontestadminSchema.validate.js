const Joi = require('joi');

// const { validateRequest } = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");
const formidable = require('formidable');
const  validateAllFieldsRequests  = require('../middleware/validateAllFieldsRequest.middleware');

//authenticateSchema
module.exports = {
    createcontestadminSchema : (req, res, next) => {
        console.log("req body", req.body)
        var form = new formidable.IncomingForm();
        form.multiples = true;

         form.parse(req, async function (err, fields, files) {
            let schema = {};
            schema = Joi.object({
            title: Joi.string(),
            subtitle: Joi.string(),
            //contestlogo: Joi.string(),
            dis_val:Joi.number(),
        });
        req.files = files;
        req.body =  validateAllFieldsRequests(res, { "body": fields }, next, schema);
        console.log("req is",req.body)
        if (req.body.title) {
            next()
        } 
    })
        
    }
}



// registerClientSchema: async (req, res, next) => {
//     var form = new formidable.IncomingForm();
//     form.multiples = true;
//     await form.parse(req, async function (err, fields, files) {
//         let schema = {};
//         //fields.type = parseInt(fields.type)
//         console.log("fields is ", fields);
//         if (fields.type == 2) {
//             schema = Joi.object({
//                 id: Joi.number(),
//                 email_id: Joi.string().min(3).max(150).required().email().messages({ 'string.empty': `"email" is required` }),
//                 full_name: Joi.string().min(3).max(LENGTH_DATATYPE.first_name).messages({ 'string.empty': `"first name" is required` }),
//                 phone_no: Joi.number().required().messages({ 'string.empty': `"phone no" is required` }),
//                 id_number: Joi.string().min(5).max(LENGTH_DATATYPE.id_number).messages({ 'string.empty': `"id number" is required` }).required(),
//                 address: Joi.string().messages({ 'string.empty': `Address is required` }),
//                 country_incop: Joi.number().messages({ 'string.empty': `"country incop" is required` }),
//                 type: Joi.number().messages({ 'string.empty': `"type" is required` }).required(),
//                 role_id: Joi.string().messages({ 'string.empty': `"roll id" is required` }).required(),
//                 services: Joi.string().messages({ 'string.empty': `services is required` }),
//                 parent_id: Joi.string(),
//                 first_name: Joi.string().min(3).max(LENGTH_DATATYPE.first_name).messages({ 'string.empty': `"first name" is required` }),
//                 middle_name: Joi.string().min(0).max(LENGTH_DATATYPE.middle_name).messages({ 'string.empty': `"middle name" is required` }),
//                 last_name: Joi.string().min(0).max(LENGTH_DATATYPE.last_name).messages({ 'string.empty': `"last name" is required` }),//.pattern(/^[0-9]+$/).required(),     

//             })
//         } else if (fields.type == 1) {
//             schema = Joi.object({
//                 id: Joi.number(),
//                 email_id: Joi.string().min(3).max(150).required().email().messages({ 'string.empty': `"email" is required` }),
//                 password: Joi.string().min(5).max(LENGTH_DATATYPE.valid_password).messages({ 'string.empty': `"password" is required` }),
//                 full_name: Joi.string().min(3).max(LENGTH_DATATYPE.first_name).messages({ 'string.empty': `"full name" is required` }).required(),
//                 first_name: Joi.string().min(3).max(LENGTH_DATATYPE.first_name).messages({ 'string.empty': `"first name" is required` }),
//                 middle_name: Joi.string().min(0).max(LENGTH_DATATYPE.middle_name).messages({ 'string.empty': `"middle name" is required` }),
//                 last_name: Joi.string().min(0).max(LENGTH_DATATYPE.last_name).messages({ 'string.empty': `"last name" is required` }),//.pattern(/^[0-9]+$/).required(),     
//                 phone_no: Joi.number().required().messages({ 'string.empty': `"phone no" is required` }),
//                 id_number: Joi.string().min(5).max(20).messages({ 'string.empty': `"id number" is required` }).required(),
//                 designation: Joi.string().min(3).max(LENGTH_DATATYPE.designation).messages({ 'string.empty': `"designation" is required` }).required(),
//                 comp_legal_name: Joi.string().min(4).max(30).messages({ 'string.empty': `"company legal name" is required` }).required(),
//                 comp_regist_no: Joi.string().min(5).max(20).messages({ 'string.empty': `"company register number" is required` }).required(),
//                 country_incop: Joi.number().messages({ 'string.empty': `"country incop" is required` }).required(),
//                 industry_opratn: Joi.number().messages({ 'string.empty': `"industry operation" is required` }).required(),
//                 address: Joi.string().messages({ 'string.empty': `Address is required` }).required(),
//                 service_required_country: Joi.string().messages({ 'string.empty': `service_required_country is required` }).required(),
//                 services: Joi.string().messages({ 'string.empty': `services is required` }).required(),
//                 countries: Joi.string().messages({ 'string.empty': `"countries" is required` }),
//                 parent_id: Joi.string(),
//                 role_id: Joi.string().messages({ 'string.empty': `"roll id" is required` }).required(),
//                 type: Joi.number().messages({ 'string.empty': `"type" is required` }).required(),
//             })
//         } else if (fields.type == 3) {
//             schema = Joi.object({
//                 email_id: Joi.string().min(3).max(150).required().email().messages({ 'string.empty': `"email" is required` }).required(),
//                 first_name: Joi.string().min(3).max(LENGTH_DATATYPE.first_name).messages({ 'string.empty': `"first name" is required` }).required(),
//                 middle_name: Joi.string().min(0).max(LENGTH_DATATYPE.middle_name).messages({ 'string.empty': `"middle name" is required` }).required(),
//                 last_name: Joi.string().min(0).max(LENGTH_DATATYPE.last_name).messages({ 'string.empty': `"last name" is required` }).required(),//.pattern(/^[0-9]+$/).required(),     
//                 phone_no: Joi.number().required().messages({ 'string.empty': `"phone no" is required` }).required(),
//                 id_number: Joi.string().min(5).max(LENGTH_DATATYPE.id_number).messages({ 'string.empty': `"id number" is required` }).required(),
//                 type: Joi.number().messages({ 'string.empty': `"type" is required` }).required(),
//                 role_id: Joi.string().messages({ 'string.empty': `"roll id" is required` }).required(),
//                 services: Joi.string().messages({ 'string.empty': `services is required` }).required(),
//                 parent_id: Joi.string(),

//             })
//         }
//         else {
//             schema = Joi.object({
//                 type: Joi.number().messages({ 'string.empty': `"type" is required` }).required(),
//             })
//         }
//         req.files = files;
//         req.body = validateAllFieldsRequests(res, { "body": fields }, next, schema);
//         if (req.body.email_id) {
//             next()
//         }
//     })
// },