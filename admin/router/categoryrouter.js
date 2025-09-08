const express = require('express')
const router = express.Router()
const authorize = require("../../middleware/authorize_admin.middleware");
const categoryController = require('../controller/categorycontroller');
const createcategorycmsSchema = require('../../validate/createcategorySchema.validate')

module.exports = router

router.post('/create', authorize, createcategorycmsSchema, categoryController.upsert_category); // Done
router.get('/list', categoryController.category_list); // Done
