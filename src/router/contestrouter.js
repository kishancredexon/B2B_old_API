const express = require('express')
const multer = require("multer");
const router = express.Router()
const Joi = require('joi');
const validateRequest = require("../../middleware/validate.middleware");
const authorize = require("../../middleware/authorize.middleware");
const path = require("path");
const response = require("../../helper/response");

const contestController = require('../controller/contestcontroller')
// const createcontactusSchema = require('../../validate/createcontactusSchema.validate');


//contactus routes
// router.post('/create', createcontactusSchema, contactusController.create_contactus)
router.post('/list', contestController.contest_list)


module.exports = router