const express = require('express')
const router = express.Router()
const authorize = require("../../middleware/authorize.middleware");

const cmsController = require('../controller/cmscontroller')



router.post('/list', cmsController.cms_list)
router.get('/category_list', cmsController.category_list)
router.post('/faq_view', cmsController.faq_list)
router.get('/web-setting',cmsController.web_setting)

module.exports = router