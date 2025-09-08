const Joi = require('joi');
const authorize = require("../middleware/authorize.middleware");
const  validateRequest  = require('../middleware/validate.middleware');



//Create User
function fantasygamelistSchema(req, res, next) {
    const schema = Joi.object({
       game_id: Joi.number().required(),
      
    });
    validateRequest(req,res, next, schema);
}

module.exports = fantasygamelistSchema;