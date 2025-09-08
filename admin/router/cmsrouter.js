const express = require('express')
const router = express.Router();
const cmsController = require('../controller/cmscontroller');
const viewcmsSchema = require('../../validate/viewcmsSchema.validate')
const updatecmsSchema = require('../../validate/updatecmsSchema.validate')
const createcmsSchema = require('../../validate/createcmsSchema.validate')

module.exports = router

router.get('/list', cmsController.cms_list); // Done
router.post('/view', viewcmsSchema, cmsController.cms_view); // Done
router.put('/update', updatecmsSchema, cmsController.cms_update); // Done
router.post('/create', createcmsSchema, cmsController.create_cms); // Done
