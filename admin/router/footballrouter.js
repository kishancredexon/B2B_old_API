const express = require('express')
const router = express.Router()
const Joi = require('joi');
const validateRequest = require("../../middleware/validate.middleware").default;
const authorize = require("../../middleware/authorize_admin.middleware");

const multer = require("multer");
const path = require("path");
const config = require("../../config.json");


const footballController = require('../controller/footballcontroller');
const footballactiveinactiveSchema = require('../../validate/footballactiveinactiveSchema');
const footballpublishSchema = require('../../validate/footballpublishSchema.validate');
// const contetsupdateSchema = require('../../validate/contestupdateSchema.validate')
// const contestactiveSchema = require('../../validate/contestactiveSchema.validate')

module.exports = router

router.get('/list', authorize, footballController.football_list);
router.get('/football_activity_list', authorize, footballController.football_activity_list);
router.post('/active-inactive', authorize, footballactiveinactiveSchema, footballController.football_active_inactive)
router.post('/cancel-match', authorize, footballactiveinactiveSchema, footballController.football_cancel_match)
router.get('/active_list', authorize, footballController.football_active_list)
router.post('/publish', authorize, footballpublishSchema, footballController.football_publish)
