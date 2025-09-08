const express = require('express');
const router = express.Router();
const authorize = require("../../middleware/authorize_admin.middleware");
const teamPlayerController = require('../controller/teamplayercontroller');
const cktteamviewteamSchema = require('../../validate/cktteamviewteamSchema.validate')
const editcktteamSchema = require('../../validate/editcktteamSchema.validate')
const editfbteamSchema = require('../../validate/editfbteamSchema.validate')
const teammetadataSchema = require('../../validate/teammetadataSchema.validate')

module.exports = router

router.get('/ckt_team_list_old', teamPlayerController.ckt_team_list); // Todo: I think we are not using this we can delete this
router.post('/ckt_team', authorize, cktteamviewteamSchema, teamPlayerController.ckt_team_find)
router.post('/edit_ckt', authorize, editcktteamSchema, teamPlayerController.edit_ckt)
router.get('/fb_team_list_old', authorize, teamPlayerController.fb_team_list);
router.post('/fb_team', authorize, cktteamviewteamSchema, teamPlayerController.fb_team_find); // Todo: I think we are not using this we can delete this
router.post('/edit_ckt_team', editcktteamSchema, teamPlayerController.edit_ckt_team);
router.post('/edit_fb_team', authorize, editfbteamSchema, teamPlayerController.edit_fb_team);

router.post('/team_add', authorize, teammetadataSchema, teamPlayerController.teammeta_upsert); // Done
router.post('/ckt_team_list', authorize, cktteamviewteamSchema, teamPlayerController.cricket_list); // Done
router.post('/fb_team_list', authorize, cktteamviewteamSchema, teamPlayerController.football_list); // Done
