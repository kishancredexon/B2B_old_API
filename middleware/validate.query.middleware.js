const response = require("../helper/response");

 module.exports = validateRequest;
 

function validateRequest (req,res, next, schema)  {
        const options = {
            abortEarly: false, // include all errors
            allowUnknown: true, // ignore unknown props
            stripUnknown: true // remove unknown props
        };
        const { error, value } = schema.validate(req.query, options);
        
        if (error) {
            return res.status(400).send(response({}, error.details[0].message.replace(/[|&;$%@"<>()+,]/g, ""), false))

            //throw error.details[0].message.replace(/[|&;$%@"<>()+,]/g, "")
            
        } else {
            req.body = value;
            next();
        }
    }