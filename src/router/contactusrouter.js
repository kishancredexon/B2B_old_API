// const express = require('express')
// const multer = require("multer");
// const router = express.Router()
// const Joi = require('joi');
// const validateRequest = require("../../middleware/validate.middleware");
// const authorize = require("../../middleware/authorize.middleware");
// const path = require("path");
// const response = require("../../helper/response");

// const contactusController = require('../controller/contactuscontroller')
// const createcontactusSchema = require('../../validate/createcontactusSchema.validate');
// //contactus routes
// router.post('/create', createcontactusSchema, contactusController.create_contactus)
// module.exports = router


const express = require('express')
const router = express.Router()

const contactusController = require('../controller/contactuscontroller')
const createcontactusSchema = require('../../validate/createcontactusSchema.validate');

// contact us form contactus routes
router.post('/create', createcontactusSchema, contactusController.create_contactus);

module.exports = router