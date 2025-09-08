const express = require('express')
const router = express.Router()
const Joi = require('joi');
const validateRequest = require("../../middleware/validate.middleware").default;
const authorize = require("../../middleware/authorize_admin.middleware");

const multer = require("multer");
const path = require("path");
const config = require("../../config.json");


const matchaccumultaorController = require('../controller/matchaccumulator.controller');


const playerlistSchema = require('../../validate/playerlistSchema.validate');
module.exports = router

router.post('/match_list',playerlistSchema, matchaccumultaorController.player_list);
