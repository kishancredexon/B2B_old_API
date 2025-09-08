const Joi = require('joi');
const validateRequest = require('../middleware/validate.middleware');
const authorize = require("../middleware/authorize.middleware");



//Create User
function subadminuserSchema(req, res, next) {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
        usertype: Joi.number().required(),
        country_code: Joi.string().required(),
        phone: Joi.string().required(),
        password: Joi.string().required(),
        dob: Joi.string().allow('').optional(),
        gender: Joi.string().allow('').optional(),
        module_data: Joi.array().items({
            User: Joi.boolean().optional(),
            Cms_Manager: Joi.boolean().optional(),
            TDS_Manager: Joi.boolean().optional(),
            Banner_Manager: Joi.boolean().optional(),
            Settings: Joi.boolean().optional(),
            Points_System: Joi.boolean().optional(),
            Wallet_Manager: Joi.boolean().optional(),
            Team_Manager: Joi.boolean().optional(),
            Banner_Manager: Joi.boolean().optional(),
            Transaction_History: Joi.boolean().optional(),
            StateManager: Joi.boolean().optional(),
            PlayerAccumulator: Joi.boolean().optional(),
            Series_Manager: Joi.boolean().optional(),
            Player_Manager: Joi.boolean().optional(),
            Withdraw_Manager: Joi.boolean().optional(),
            Matches: Joi.boolean().optional(),
            Series: Joi.boolean().optional(),
        }),
    });
    validateRequest(req, res, next, schema);
}

module.exports = subadminuserSchema;