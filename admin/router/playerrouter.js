const express = require('express');
const router = express.Router();
const authorize = require("../../middleware/authorize_admin.middleware");
const playerController = require('../controller/playercontroller');
const cktplymetadataSchema = require('../../validate/cktplymetadataSchema.validate');
const cktplymetadatadeleteSchema = require('../../validate/cktplymetadatadeleteSchema.validate');
const fbplymetadatadeleteSchema = require('../../validate/fbplymetadatadeleteSchema.validate');
const matchcontroller = require('../../src/controller/matchcontroller');
const sereisplayerlistSchema = require('../../validate/sereisplayerlistSchema.validate');

module.exports = router

router.post('/ply_add', authorize, cktplymetadataSchema, playerController.cktnfbplayer_upsert); // Done
router.post('/cricket/status', authorize, cktplymetadatadeleteSchema, playerController.cktplayer_delete)
router.post('/football/status', authorize, fbplymetadatadeleteSchema, playerController.fbplayer_delete)
router.post('/player_list', authorize, playerController.player_list); // Done
router.post('/sereis_player_list', authorize, sereisplayerlistSchema, matchcontroller.sereis_player_list);
