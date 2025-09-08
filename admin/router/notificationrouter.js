const express = require('express');
const notificationCreateSchema = require('../../validate/notificationCreateSchema.validate');
const notifiController = require('../controller/notificationcontroller');
const authorize = require("../../middleware/authorize_admin.middleware");

const router = express.Router()

router.post('/send_message', authorize, notificationCreateSchema, notifiController.send_notification); // Done
router.post('/list', notifiController.notification_list); // Done

module.exports = router