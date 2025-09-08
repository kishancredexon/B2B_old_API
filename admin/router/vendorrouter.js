const express = require('express')
const router = express.Router()

const vendorController = require('../controller/vendorcontroller');

const vendorSchema = require('../../validate/vendorSchema.validate')

router.post('/create', vendorSchema, vendorController.add_vendor);// Done
router.post('/login', vendorController.vendor_authenticate); // Done

router.post('/user_balance', vendorController.test_vendor_user); //Todo: As i check we are not using this api in frontend
router.post('/user_check', vendorController.test_vendor_check); //Todo: As i check we are not using this api in frontend
router.post('/deposit', vendorController.test_vendor_deposit); //Todo: As i check we are not using this api in frontend

module.exports = router

