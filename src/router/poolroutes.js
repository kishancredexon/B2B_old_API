const express = require('express')
const router = express.Router()
const authorize = require("../../middleware/authorize.middleware");
const path = require("path");
const publishmatchlistSchema = require('../../validate/publishmatchlistSchema.validate')

const poolcontroller = require('../controller/poolcontroller');
const joinPoolSchema = require('../../validate/joinpoolSchema.validate');
const joinPoolPrizeSchema = require('../../validate/joinPoolPrizeSchema.validate');
const poolContestListSchema = require('../../validate/poolContestListSchema.validate');
const poolContestSeriesSchema = require('../../validate/poolContestSeriesSchema.validate');
const seriesPrivatePoolSchema = require('../../validate/seriesPrivatePoolSchema.validate')
const pooldetailSchema = require('../../validate/pooldetailSchema.validate')
const filterlistcktSchema =require('../../validate/filterlistcktSchema.validate')
const poolseriesdetailSchema = require('../../validate/poolseriesdetailSchema.validate')
const { match_cricket_pool_contest_list, match_football_pool_contest_list, series_cricket_pool_contest_list, series_football_pool_contest_list, pool_detail, series_pool_detail } = require('../controller/poolcontroller');
const privateContestSizeSchema = require('../../validate/privateContestSizesSchema.validate');
const privatePoolSchema = require('../../validate/privatePoolSchema.validate');
const joinpoolseriesSchema = require('../../validate/joinpoolseriesSchema.validate')
const joinPoolPrizeseriesSchema = require('../../validate/joinPoolPrizeseriesSchema.validate')
const matchContestSchema = require('../../validate/matchContestSchema.validate');
const userTeamPlayerSchema = require('../../validate/userTeamPlayerSchema.validate');
router.post('/matches/cricket/pool_contest_list', authorize, poolContestListSchema, match_cricket_pool_contest_list)
router.post('/filter',authorize,filterlistcktSchema,poolcontroller.filter_contest_ckt)

// router.post('/matches/cricket/pool_contest_all_list', authorize, poolContestListSchema, match_cricket_pool_contest_all_list)

router.post('/matches/football/pool_contest_list', authorize, poolContestListSchema, match_football_pool_contest_list)

router.post('/series/cricket/pool_contest_list', authorize, poolContestSeriesSchema, series_cricket_pool_contest_list)
router.post('/series/football/pool_contest_list', authorize, poolContestSeriesSchema, series_football_pool_contest_list)
router.post('/match/cricket/pool_detail', authorize, pooldetailSchema, pool_detail)
router.post('/match/football/pool_detail', authorize, pooldetailSchema, poolcontroller.fb_pool_detail)

router.post('/series/cricket/pool_detail', authorize, poolseriesdetailSchema, series_pool_detail)
router.post('/series/football/pool_detail',authorize, poolseriesdetailSchema, poolcontroller.series_fb_pool_detail)

router.post('/join_pool', authorize, joinPoolSchema, poolcontroller.join_pool_contest)
router.post('/confirm_join_pre', authorize, joinPoolPrizeSchema, poolcontroller.prize_join_preview)

router.post('/matches/cricket/mypool', authorize, poolContestListSchema, poolcontroller.my_pool_contest_match_cricket)
router.post('/matches/football/mypool', authorize, poolContestListSchema, poolcontroller.my_pool_contest_match_football)
router.post('/series/cricket/mypool', authorize, poolContestSeriesSchema, poolcontroller.my_pool_contest_series_cricket)
router.post('/series/football/mypool', authorize, poolContestSeriesSchema, poolcontroller.my_pool_contest_series_football)
router.post('/privatecontest/contestsize', authorize, privateContestSizeSchema, poolcontroller.private_contest_size_list)
router.post('/privatecontest/save', authorize, privatePoolSchema, poolcontroller.private_contest_save)
router.post('/match/poolprizebreak', poolcontroller.poolprizebreaksave)
router.post('/sereis/privatecontest/save', authorize, seriesPrivatePoolSchema, poolcontroller.series_private_contest_save)

router.post('/join_pool_series', authorize, joinpoolseriesSchema, poolcontroller.join_pool_contest)
router.post('/confirm_join_pre_series', authorize, joinPoolPrizeseriesSchema, poolcontroller.prize_join_preview_series)

router.post('/match_contest', matchContestSchema, poolcontroller.match_contest)

router.post('/matches/user_team_player_list',authorize, userTeamPlayerSchema, poolcontroller.user_team_player_list)

module.exports = router