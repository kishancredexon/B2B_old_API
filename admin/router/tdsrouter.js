const express = require('express')
const router = express.Router()
const authorize = require("../../middleware/authorize_admin.middleware");
const tdsController = require('../controller/tdscontroller');

module.exports = router

router.post('/list', authorize, tdsController.tds_list); // Done
