const express = require('express')
const router = express.Router()
const authorize = require("../../middleware/authorize.middleware");

const notifyController = require('../controller/notificationcontroller')



router.post('/list',authorize, notifyController.notification_list)
//router.get('/notification_read',authorize, notifyController.notification_read)


module.exports = router