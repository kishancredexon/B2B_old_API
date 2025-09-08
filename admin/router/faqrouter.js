const express = require('express')
const router = express.Router()

const authorize = require("../../middleware/authorize_admin.middleware");
const faqController = require('../controller/faqcontroller');
const createfaqSchema = require('../../validate/createfaqSchema.validate');
const updatefaqSchema = require('../../validate/updatefaqSchema.validate');

module.exports = router

router.post('/create', authorize, createfaqSchema, faqController.create_faq); // Done
router.put('/update', authorize, updatefaqSchema, faqController.faq_update); // Done
router.get('/list', authorize, faqController.faq_list); // Done
