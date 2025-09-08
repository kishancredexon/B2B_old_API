const express = require('express')
const multer = require("multer");
const router = express.Router()
const Joi = require('joi');
const validateRequest = require("../../middleware/validate.middleware");
const authorize = require("../../middleware/authorize.middleware");
const path = require("path");
const response = require("../../helper/response");

const matchController = require('../controller/matchcontroller');
const playerlistSchema = require('../../validate/playerlistSchema.validate');
const addplayerlistSChema = require('../../validate/addplayerlistSChema.validate')
const cricketSeriesSchema = require('../../validate/cricketSeriesSchema.validate')
const footballSeriesSchema = require('../../validate/footballSeriesSchema.validate')
const publishmatchlistSchema = require('../../validate/publishmatchlistSchema.validate')
const publishfootballlistSchema = require('../../validate/publishfootballlistSchema.validate')
const teamlistSchema = require('../../validate/teamlistSchema.validate')
const prizepoollistSchema = require('../../validate/prizepoollistSchema.validate')
const addaccteamSchema = require('../../validate/addaccteamSchema.validate')
const addprizepoolSchema = require('../../validate/addprizepoolSchema.validate')
const playerdeatilSchema = require('../../validate/playerdeatilSchema.validate');
const seriesplayerdetailSchema = require('../../validate/seriesplayerdetailSchema')
const seriesaddplayerlistSchema = require('../../validate/seriesaddplayerlistSchema')
const sereisplayerlistSchema = require('../../validate/sereisplayerlistSchema.validate')
const substituteplayeraddSchema = require('../../validate/substituteplayeraddSchema.validate')
const editMatchPlayerListSchema = require('../../validate/editMatchPlayerListSchema.validate')
const editSeriesPlayerListSchema = require('../../validate/editSeriesPlayerListSchema.validate')
const userMatchPlayerListSChema = require('../../validate/userMatchPlayerListSchema.validate')
const cloneMatchPlayerListSChema = require('../../validate/cloneMatchPlayerListSChema.validate')
const cloneSeriesPlayerListSChema = require('../../validate/cloneSeriesPlayerListSChema.validate')
const commentaryscoreListSChema = require('../../validate/commentaryscoreListSChema.validate')
const teamSchema = require('../../validate/teamSchema.validate')
const addcoinsSchema = require('../../validate/addcoinsSchema.validate')
const teamseriesSchema = require('../../validate/teamseriesSchema.validate')
const { my_match_cricket_list, my_match_football_list, my_series_cricket_list, my_series_football_list } = require('../controller/mymatchcontroller');
const addaccplySchema = require('../../validate/addaccplySchema.validate');
const teamProfileDetailSchema = require('../../validate/teamProfileDetailSChema.validate');
const seriesTeamStatsSchema = require('../../validate/seriesTeamStatsSchema.validate');
const seriesMatchSchema = require('../../validate/seriesMatchSchema.validate');
const substituteplayerupdateSchema = require('../../validate/substituteplayerupdateSchema.validate');
//contactus routes
// router.post('/create', createcontactusSchema, contactusController.create_contactus)
router.post('/publish_match_list', authorize, publishmatchlistSchema, matchController.publish_active_match_list)
router.post('/publish_football_list', authorize, publishfootballlistSchema, matchController.publish_active_football_list)
router.post('/cricket/series', authorize, cricketSeriesSchema, matchController.cricket_list)
router.post('/football/series', authorize, footballSeriesSchema, matchController.football_list)

router.post('/cricket/matches/myportfolio', authorize, publishmatchlistSchema, my_match_cricket_list)
router.post('/football/matches/myportfolio', authorize, publishfootballlistSchema, my_match_football_list)
router.post('/cricket/series/myportfolio', authorize, cricketSeriesSchema, my_series_cricket_list)
router.post('/football/series/myportfolio', authorize, footballSeriesSchema, my_series_football_list)

router.post('/player_list', authorize, playerlistSchema, matchController.player_list)
router.post('/save_player', authorize, addplayerlistSChema, matchController.addplayer_list)

router.post('/accumulator/team_list', authorize, teamlistSchema, matchController.team_list)
router.post('/accumulator/add_team', authorize, addaccteamSchema, matchController.add_ply_accumulator)

router.post('/accumulator/add_plyaccumulator', authorize, addaccplySchema, matchController.add_ply_accumulator)

router.post('/accumulator/prize_pool_list', authorize, prizepoollistSchema, matchController.prize_pool_list)
router.post('/accumulator/add_prize_pool', authorize, addprizepoolSchema, matchController.add_prize_pool)

router.post('/player_detail',authorize, playerdeatilSchema, matchController.player_detail)
router.post('/series_player_detail', authorize, seriesplayerdetailSchema, matchController.series_player_detail)
router.post('/save_series_player', authorize, seriesaddplayerlistSchema, matchController.series_add_player)
router.post('/add_substitute_player_series', authorize, substituteplayeraddSchema, matchController.substitue_add_series_player)
router.post('/sereis_player_list', authorize, sereisplayerlistSchema, matchController.sereis_player_list)
router.post('/cricket/team', authorize, teamSchema, matchController.team_list_user)
router.post('/football/team', authorize, teamSchema, matchController.team_list_user)
router.post('/cricket/seriesteam', authorize, teamseriesSchema, matchController.team_series_list_ckt)
router.post('/football/seriesteam', authorize, teamseriesSchema, matchController.team_series_list_user_fb)
// router.post('/player_view',playerdeatilSchema,matchController.player_detail_view)
router.post('/edit_match_player_list', authorize, editMatchPlayerListSchema, matchController.edit_match_player_list)

router.post('/edit_series_player_list', authorize, editSeriesPlayerListSchema, matchController.edit_series_player_list)
router.post('/cricket/user_match_player_list', authorize, userMatchPlayerListSChema, matchController.user_ckt_match_player_list)
router.post('/football/user_match_player_list', authorize, userMatchPlayerListSChema, matchController.user_fb_match_player_list)
router.post('/cricket/match/clone_player_list', authorize, cloneMatchPlayerListSChema, matchController.clone_match_player_list)
router.post('/football/match/clone_player_list', authorize, cloneMatchPlayerListSChema, matchController.clone_match_fb_player_list)
router.post('/cricket/series/clone_player_list', authorize, cloneSeriesPlayerListSChema, matchController.clone_series_player_list)
router.post('/football/series/clone_player_list', authorize, cloneSeriesPlayerListSChema, matchController.clone_series_fb_player_list)

router.post('/add_coins', authorize, addcoinsSchema, matchController.add_coins)
router.post('/live_score',authorize, matchController.live_score)
router.post('/fb_live_score',authorize, matchController.fb_live_score)

router.post('/commentary_score_list',authorize, commentaryscoreListSChema, matchController.commentary_score_list)

router.post('/team_profile_detail',authorize, teamProfileDetailSchema, matchController.team_profile_detail)

router.post('/series_team_stats_list',authorize, seriesTeamStatsSchema, matchController.series_team_stats_list)

router.post('/series_match_list',authorize, seriesMatchSchema, matchController.series_match_list)

router.post('/update_substitute_player_series', authorize, substituteplayerupdateSchema, matchController.update_substitute_player_series)


module.exports = router