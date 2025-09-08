const express = require('express')
const router = express.Router()
const authorize = require("../../middleware/authorize_admin.middleware");
const contactusController = require('../controller/contactuscontroller')

router.get("/get_all_contact_us_requests",authorize,contactusController.get_all_contact_us_requests); // Done

module.exports = router
