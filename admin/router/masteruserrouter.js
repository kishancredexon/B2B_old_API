const express = require('express')
const router = express.Router()

const masterUserController = require('../controller/masterusercontroller');

router.get('/create-master-user', masterUserController.create_master_user); // Done

module.exports = router