const express = require('express')
const router = express.Router()
const Joi = require('joi');
const validateRequest = require("../../middleware/validate.middleware").default;
const authorize = require("../../middleware/authorize_admin.middleware");

const multer = require("multer");
const path = require("path");
const config = require("../../config.json");


const playermanagerController = require('../controller/playermanagercontroller');



module.exports = router

router.get('/list',playermanagerController.playermanager_list);
