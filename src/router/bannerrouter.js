const express = require('express')
const multer = require("multer");
const router = express.Router()
const Joi = require('joi');
const validateRequest = require("../../middleware/validate.middleware");
const authorize = require("../../middleware/authorize.middleware");
const path = require("path");
const response = require("../../helper/response");

const bannerController = require('../controller/bannercontroller')
const bannerlistSchema = require('../../validate/bannerlistSchema.validate');


router.post('/list',authorize,bannerlistSchema,bannerController.banner_list)
router.get('/swaggerscroll',bannerController.page_scroll)


module.exports = router