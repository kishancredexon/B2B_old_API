const express = require('express')
const router = express.Router()
const Joi = require('joi');
const validateRequest = require("../../middleware/validate.middleware")
const authorize = require("../../middleware/authorize_admin.middleware");


const contestController = require('../controller/contestcontroller');


const response = require("../../helper/response");
const {createcontestadminSchema} = require('../../validate/createcontestadminSchema.validate');
const contestViewSchema = require('../../validate/contestViewSchema.validate');
const contetsupdateSchema = require('../../validate/contestupdateSchema.validate')
const contestactiveSchema = require('../../validate/contestactiveSchema.validate')
const contestOrderSchema = require('../../validate/contestOrderSchema.validate')
module.exports = router

router.post('/create',authorize,createcontestadminSchema, contestController.create_contest);
router.post('/view',authorize, contestViewSchema, contestController.contest_view)
router.post('/update',authorize, contetsupdateSchema, contestController.contest_update)
router.post('/active-inactive',authorize, contestactiveSchema, contestController.constest_active)
router.post('/change-contest-order',authorize, contestController.cahnge_constest_order)
router.get('/list', authorize, contestController.contest_list)