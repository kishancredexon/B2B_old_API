const axios = require("axios");
const response = require("./../middleware/response");
const { connectWithCricketDb } = require("../config/mongodb_connections");
const createUpcomingCricketModel = require("../mongo_models_new/credexon_cricket/UpcomingCricketsSchema");
const createCktMatchScoresModel = require("../mongo_models_new/credexon_cricket/CktMatchScoresSchema");


/*
Upcoming Status=1
*/
let upcomingCricketList = async (req, res) => {
    const cktDbConnection = await connectWithCricketDb();
    const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);

    let matchid = req.body.matchid;
    let request = {};
    if (matchid) {
        request["match_id"] = matchid;
    } else {
        request["status"] = 1;
        request["pre_squad"] = true;
    }
    let upcomingCricket = await UpcomingCricketsSchema.find(request);

    if (upcomingCricket && upcomingCricket.length > 0) {
        return response(true, "Upcoming list", upcomingCricket, null, req, res, null, null)
    } else {
        return response(false, "No data", upcomingCricket, null, req, res, null, null)
    }
}

let playersCricketList = async (req, res) => {
    const cktDbConnection = await connectWithCricketDb();
    const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);

    var allMatchPlayers = [];
    let matchid = req.body.matchid;
    let request = {};
    if (matchid) {
        request["match_id"] = matchid;
    } else {
        request["status"] = 1;
        request["pre_squad"] = true;
    }
    let upcomingCricket = await UpcomingCricketsSchema.find(request);
    if (upcomingCricket && upcomingCricket.length > 0) {
        upcomingCricket.forEach(async (item, index) => {
            let players = {};
            let teamAId = item.teama.team_id;
            let teamBId = item.teamb.team_id;
            matchid = item.match_id;
            let playersCricket = await cricketPlayersSchema.find({ "team_id": { $in: [teamAId, teamBId] } });
            players["match_id"] = matchid;
            players["teama"] = (teamAId == playersCricket[0].team_id) ? playersCricket[0] : playersCricket[1];
            players["teamb"] = (teamBId == playersCricket[0].team_id) ? playersCricket[0] : playersCricket[1];
            allMatchPlayers.push(players);
            if (upcomingCricket.length === (index + 1)) {
                return response(true, "players list", allMatchPlayers, null, req, res, null, null)
            }

        })

    } else {
        return response(false, "No players list", [], null, req, res, null, null)
    }

}

//Live Status=3
let scoresCricketDetail = async (req, res) => {
    const cktDbConnection = await connectWithCricketDb();
    const CktMatchScoresSchema = createCktMatchScoresModel(cktDbConnection);

    let matchid = req.body.matchid;
    let request = {}
    if (matchid) {
        request["match_id"] = matchid;
    } else {
        request["status"] = 3;
    }

    let upcomingCricket = await CktMatchScoresSchema.find(request);

    if (upcomingCricket && upcomingCricket.length > 0) {
        return response(true, "Score data", upcomingCricket, null, req, res, null, null)
    } else {
        return response(false, "No score data", upcomingCricket, null, req, res, null, null)
    }
}


//Live Status=3
let scoresCricketShortList = async (req, res) => {
    const cktDbConnection = await connectWithCricketDb();
    const CktMatchScoresSchema = createCktMatchScoresModel(cktDbConnection);

    let matchid = req.body.matchid;
    let request = {}
    if (matchid) {
        request["match_id"] = matchid;
    } else {
        request["status"] = 2;
    }
    let upcomingCricket = await CktMatchScoresSchema.find(request, { match_id: 1, teama: 1, teamb: 1, format_str: 1, "competition.match_format": 1 });
    if (upcomingCricket && upcomingCricket.length > 0) {
        return response(true, "Score data", upcomingCricket, null, req, res, null, null)
    } else {
        return response(false, "No score data", upcomingCricket, null, req, res, null, null)
    }
}


module.exports = { upcomingCricketList, playersCricketList, scoresCricketDetail, scoresCricketShortList };