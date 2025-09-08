const express = require('express')
const router = express.Router()
const authorize = require("../../middleware/authorize_admin.middleware");
const subadminController = require('../controller/subadmincontroller');
const subadminuserSchema = require('../../validate/subadminUserSchema.validate')

module.exports = router


router.post('/create', authorize, subadminuserSchema, subadminController.subadmin_create) // Done
router.post('/list', authorize, subadminController.subadmin_list) // Done
router.post('/active-inactive', authorize, subadminController.activeInactive_subadmin) // Done
router.delete('/delete', authorize, subadminController.delete_subadmin) // Dnone
router.post('/update', authorize, subadminController.update_subadmin) // Done
router.post('/view', authorize, subadminController.subadmin_view) // Done

