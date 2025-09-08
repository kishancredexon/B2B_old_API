const express = require('express');
const router = express.Router();
const authorize = require("../../middleware/authorize_admin.middleware");
const bannerController = require('../controller/bannercontroller');
const bannercreateSchema = require('../../validate/bannercreateSchema.validate')
const bannereditSchema = require('../../validate/bannereditSchema.validate')

router.post('/save', authorize, bannercreateSchema, bannerController.banner_save); // Done
router.get('/list', authorize, bannerController.banner_list); // Done
router.post('/edit', authorize, bannereditSchema, bannerController.banner_edit); // Done

module.exports = router
