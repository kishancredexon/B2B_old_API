const express = require("express");
const router = express.Router();
const authorize = require("../../middleware/authorize_admin.middleware");

const matchController = require("../controller/matchcontroller");
const matchactiveinactiveSchema = require("../../validate/matchactiveinactiveSchema.validate");
const matchpublishSchema = require("../../validate/matchpublishSchem.validate");
const fantasygamelistSchema = require("../../validate/fantasygamelistSchema.validate");
const fantasytypelistSchema = require("../../validate/fantasytypelistSchema.validate");
const updatefantasySchema = require("../../validate/updatefantasySchema.validate");
// const contestViewSchema = require('../../validate/contestViewSchema.validate');
// const contetsupdateSchema = require('../../validate/contestupdateSchema.validate')
// const contestactiveSchema = require('../../validate/contestactiveSchema.validate')

module.exports = router;

router.get("/list", authorize, matchController.match_list);
router.get("/cricket_activity_list", authorize, matchController.match_activity_list);
router.get("/listByStatus", authorize, matchController.match_list_by_status); // Done
router.get("/footballlistByStatus", authorize, matchController.football_match_list_by_status); // Done
router.get("/series/list", authorize, matchController.series_match_list);
router.get("/series/active_list", authorize, matchController.seires_active_list);
router.post("/series/active-inactive", authorize, matchController.Series_active_inactive_ckt);
router.post("/series/football/active_inactive", authorize, matchController.Series_active_inactive_fb);

router.post("/active-inactive", authorize, matchactiveinactiveSchema, matchController.Match_active_inactive);
router.post("/cancel-match", authorize, matchactiveinactiveSchema, matchController.Match_cancel);
router.get("/active_list", authorize, matchController.match_active_list);
router.post("/publish", authorize, matchpublishSchema, matchController.match_publish);

router.get("/fantasy_list", authorize, matchController.fantasy_list); // Done
router.post("/fantasygame_list", authorize, fantasygamelistSchema, matchController.fantasygame_list);
router.post("/fantasygame_type_list", authorize, fantasytypelistSchema, matchController.fantasygame_type_list);
router.put("/update_fantasygame_points", authorize, updatefantasySchema, matchController.update_fantasygame_points); // Done

router.post("/current_match_list", authorize, matchController.get_current_match_list); // Todo: Need to check with raman