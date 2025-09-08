const express = require('express')
const router = express.Router()
const authorize = require("../../middleware/authorize_admin.middleware");
const playeraccumulatorController = require('../controller/playeraccumulatorcontroller');

module.exports = router

router.get('/series_list', authorize, playeraccumulatorController.player_acc_list); // Done
router.post('/match_list', authorize, playeraccumulatorController.player_aac_match_list); // Done
router.post('/player_list', playeraccumulatorController.player_acc_player_list); // Done
router.post('/update_player', playeraccumulatorController.update_player); // Done
