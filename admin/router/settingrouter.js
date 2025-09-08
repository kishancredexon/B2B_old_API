const express = require('express')
const router = express.Router()
const authorize = require("../../middleware/authorize_admin.middleware");
const settingController = require('../controller/settingcontroller');

module.exports = router

router.post('/create', authorize, settingController.setting_upsert); // Done
router.get('/view', authorize, settingController.setting_view); // Done
