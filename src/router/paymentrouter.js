const express = require('express')
const router = express.Router()
const Joi = require('joi');
const validateRequest = require("../../middleware/validate.middleware").default;
const authorize = require("../../middleware/authorize.middleware");

const multer = require("multer");
const path = require("path");
const config = require("../../config.json");
const {phonePePay,responsePhonePe,phonePePayMobile, responsePhonePeMobile}=require("./../controller/phonepeController");


const paymentController = require('../controller/paymentController');
//const cktteamviewteamSchema = require('../../validate/cktteamviewteamSchema.validate')




//router.post('/createOrder',authorize,createOrderSchema, paymentController.createOrder);
router.post('/createOrder', paymentController.createOrder);
router.post('/createOrderInTrans', paymentController.createOrderInTrans);


router.post('/verifyOrder',authorize, paymentController.verifyOrder);

router.post('/phonepepay', phonePePay);
router.post('/responsephonepe', responsePhonePe);

router.post('/phonepepay/mobile',authorize, phonePePayMobile);
router.post('/responsephonepe/mobile', responsePhonePeMobile);


module.exports = router