const Joi = require('joi');
const validateRequest  = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");
const validateAllFieldsRequests = require('../middleware/validateAllFieldsRequest.middleware');
const formidable = require('formidable');

// function updatecompleteprofileSchema(req, res, next) {
//     const schema = Joi.object({
//         name: Joi.string().allow('').optional(),
//         dob:  Joi.string().allow('').optional(),
//         gender: Joi.string().allow('').optional(),
//         address: Joi.string().allow('').optional(),
//         cityid: Joi.number().optional(),
//         stateid: Joi.number().optional(),
//         pincode:Joi.string().allow('').optional(),
        
//     });
//     validateRequest(req,res, next, schema);
// }

function updatecompleteprofileSchema(req, res, next) {
    console.log("req body", req.body)
    var form = new formidable.IncomingForm();
    form.multiples = true;

     form.parse(req, async function (err, fields, files) {
        let schema = {};
        schema = Joi.object({
                    userid: Joi.string().required(),
                    name: Joi.string().allow('').optional(),
                    dob:  Joi.string().allow('').optional(),
                    gender: Joi.string().allow('').optional(),
                    address: Joi.string().allow('').optional(),
                    cityid: Joi.number().optional(),
                    stateid: Joi.number().optional(),
                    pincode:Joi.string().allow('').optional(),
                    profilepic: Joi.string(),
    });
    req.files = files;
    req.body =  validateAllFieldsRequests(res, { "body": fields }, next, schema);
    console.log("req is",req.body)
    if (req.body.userid) {
        next()
    } 
})
    
}

module.exports = updatecompleteprofileSchema;


// const Joi = require('joi');

// const authorize = require("../middleware/authorize.middleware");
// const formidable = require('formidable');
// const validateAllFieldsRequests = require('../middleware/validateAllFieldsRequest.middleware');

// //authenticateSchema
// module.exports = {
//     updatecompleteprofileSchema: (req, res, next) => {
//         console.log("req body", req.body)
//         var form = new formidable.IncomingForm();
//         form.multiples = true;

//         form.parse(req, async function (err, fields, files) {
//             let schema = {};
//             schema = Joi.object({
//                 name: Joi.string(),
//                 dob: Joi.string(),
//                 gender: Joi.string(),
//                 address: Joi.string(),
//                 cityid: Joi.string(),
//                 stateid: Joi.number(),
//                 pincode: Joi.string()
         
//             });
//             req.files = files;
//             req.body = validateAllFieldsRequests(res, { "body": fields }, next, schema);
//             console.log("req is", req.body)
//             if (req.body.name) {
//                 next()
//             }
//         })

//     }
// }