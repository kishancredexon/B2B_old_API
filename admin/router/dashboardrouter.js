const express = require('express')
const router = express.Router()
const authorize = require("../../middleware/authorize_admin.middleware");
const dashboardController = require('../controller/dashboardcontroller');
const dashbordVendorsDetailsSchema = require('../../validate/dashboardvendorsSchema.validate');

router.get('/list', authorize, dashboardController.dashbord_list) // Done
router.post('/dashboard_vender_details',dashbordVendorsDetailsSchema,dashboardController.dashbord_vendors_details)//Done

module.exports = router
