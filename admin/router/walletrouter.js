const express = require('express')
const router = express.Router()

const authorize = require("../../middleware/authorize_admin.middleware");
const walletController = require('../controller/walletcontroller');

module.exports = router

router.get('/list', authorize, walletController.wallet_list); // Done
router.post('/filter', authorize, walletController.wallet_filter); // Done
router.post('/update', authorize, walletController.wallet_update); // Done
router.get('/Withdraw/list', authorize, walletController.withdraw_list); // Done
