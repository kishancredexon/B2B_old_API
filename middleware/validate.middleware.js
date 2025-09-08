const response = require("../helper/response");

 module.exports = validateRequest;
 
//  function validateAllFieldsRequests  (res, req, next, schema)  {
//     const options = {
//         abortEarly: false, // include all errors
//         allowUnknown: true, // ignore unknown props
//         stripUnknown: true // remove unknown props
//     };
//     const { error, value } = schema.validate(req.body, options);

//     if (error) {
//         let errorMessages = {};

//         for (var i = 0; i < error.details.length; i++) {

//             let errorData = {
//                 "message": error.details[i].message.replace(/[|&;$%@"<>()+,]/g, "")
//             };
//             let keyy = error.details[i].path[0];
//             errorMessages[keyy] = errorData;
//             // errorMessages.push(errorData);
//         }
//         return res.status(400).json({ errorMessage: errorMessages });
//     } else {
//         return req.body = value;
//         //return res.status(200).json({ value: req.body }); 
//     }
// }
// module.exports = {
function validateRequest (req,res, next, schema)  {
        const options = {
            abortEarly: false, // include all errors
            allowUnknown: true, // ignore unknown props
            stripUnknown: true // remove unknown props
        };
        const { error, value } = schema.validate(req.body, options);
        
        if (error) {
            return res.status(400).send(response({}, error.details[0].message.replace(/[|&;$%@"<>()+,]/g, ""), false))

            //throw error.details[0].message.replace(/[|&;$%@"<>()+,]/g, "")
            
        } else {
            req.body = value;
            next();
        }
    }
    //  validateAllFieldsRequests : async (res, req, next, schema) => {
    //     const options = {
    //         abortEarly: false, // include all errors
    //         allowUnknown: true, // ignore unknown props
    //         stripUnknown: true // remove unknown props
    //     };
    //     const { error, value } = schema.validate(req.body, options);
    
    //     if (error) {
    //         let errorMessages = {};
    
    //         for (var i = 0; i < error.details.length; i++) {
    
    //             let errorData = {
    //                 "message": error.details[i].message.replace(/[|&;$%@"<>()+,]/g, "")
    //             };
    //             let keyy = error.details[i].path[0];
    //             errorMessages[keyy] = errorData;
    //             // errorMessages.push(errorData);
    //         }
    //         return res.status(400).json({ errorMessage: errorMessages });
    //     } else {
    //         return req.body = value;
    //         //return res.status(200).json({ value: req.body }); 
    //     }
    // }
// }











