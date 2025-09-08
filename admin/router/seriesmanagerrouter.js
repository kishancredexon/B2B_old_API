const express = require('express');
const router = express.Router();
const authorize = require("../../middleware/authorize_admin.middleware");

const seriesmangerController = require('../controller/sereismanagercontroller');
const seriesmanagercktSchema = require('../../validate/seriesmanagercktSchema.validate');
const editcktteamSchema = require('../../validate/editcktteamSchema.validate');
const editfbteamSchema = require('../../validate/editfbteamSchema.validate');
const teamseriesmetadataSchema = require('../../validate/teamseriesmetadataSchema.validate');

module.exports = router

router.get('/ckt_team_list_old', authorize, seriesmangerController.sereis_ckt_team_list); // Todo: I think we are not using this because this is previous
router.post('/ckt_team', authorize, seriesmanagercktSchema, seriesmangerController.sereis_ckt_team_find)
router.post('/edit_ckt', authorize, editcktteamSchema, seriesmangerController.sereis_edit_ckt)
router.get('/fb_team_list_old', authorize, seriesmangerController.sereis_fb_team_list);
router.post('/fb_team', authorize, seriesmanagercktSchema, seriesmangerController.sereis_fb_team_find)
router.post('/edit_fb', authorize, editfbteamSchema, seriesmangerController.sereis_edit_fb)

router.post('/series_team_add', authorize, teamseriesmetadataSchema, seriesmangerController.teamseriesmetadata_upsert); // Done
router.post('/ckt_team_list', authorize, seriesmanagercktSchema, seriesmangerController.cricket_list); // Done
router.post('/fb_team_list', authorize, seriesmanagercktSchema, seriesmangerController.football_list); // Done
