const express = require('express');
const router = express.Router();
const stateditSchema = require('../../validate/sateeditSchema.validate');
const statemanagerController = require('../controller/statemangercontroller');

module.exports = router

router.get('/list', statemanagerController.state_list); // Done
router.post('/edit', stateditSchema, statemanagerController.state_list_edit); // Done
