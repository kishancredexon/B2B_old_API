const express = require("express");
const router = express.Router();
const authorize = require("../../middleware/authorize_admin.middleware");
const poolmasterController = require("../controller/poolmastercontroller");

const poolprizebreakdeleteSchema = require("../../validate/poolprizebreakdeleteSchema.validate");
const poolCheckedSchema = require("../../validate/poolCheckedSchema.validate");
const poolListViewSchema = require("../../validate/poolListViewSchema.validate");
const poolPrizeBreakSchema = require("../../validate/poolPrizeBreakSchema.validate");
const poolPrizeBreakEditSchema = require("../../validate/poolPrizeBreakEditSchema.validate");
const poolwithActiveMatchSchema = require("../../validate/poolwithActiveMatchSchema.validate");
const poolmasterlistSchema = require("../../validate/poolmasterlistSchema.validate");
const poolSeriesDateSchema = require("../../validate/poolSeriesDateSchema.validate");
module.exports = router;

router.post("/create", authorize, poolmasterController.create_pool);
router.post("/pool_calculation", authorize, poolmasterController.pool_calculation);
router.post("/series_datetime_pool", authorize, poolSeriesDateSchema, poolmasterController.save_series_pool_date);

router.post("/pool_range", authorize, poolPrizeBreakSchema, poolmasterController.create_pool_prize);
router.post("/cricket/active_pool_list", authorize, poolmasterController.match_cricket_pool_contest_list);
router.post("/cricket/active_contest_pool_status_list", authorize, poolmasterController.match_cricket_active_pool_contest_status_list); // Done
router.post("/cricket/active_all_contest_pool_status_list", authorize, poolmasterController.match_cricket_all_active_pool_contest_status_list); // Done

router.post("/all_active_pool_list", authorize, poolmasterController.active_contest_list); // Done
router.post("/football/active_pool_list", authorize, poolwithActiveMatchSchema, poolmasterController.match_football_pool_contest_list);

//
router.post("/edit_pool_range", authorize, poolPrizeBreakEditSchema, poolmasterController.edit_pool_prize);
router.post("/active_inactive_pool", authorize, poolmasterController.active_inactive_pool);
router.post("/active_inactive_contest_pool_match", authorize, poolmasterController.active_inactive_contest_pool_match);

router.delete("/delete", authorize, poolprizebreakdeleteSchema, poolmasterController.delete_pool_prize);
router.post("/list", authorize, poolmasterlistSchema, poolmasterController.poolmaster_list);
router.post("/view", authorize, poolListViewSchema, poolmasterController.pool_list_view);
router.post("/ischecked", authorize, poolCheckedSchema, poolmasterController.pool_list_checked);
