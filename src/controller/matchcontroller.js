let sdb = require("../../models");
const response = require("../../helper/response");
const { settingDetail, dateTimeChange, calDeductBal, sortingData, matchType, dateTimeZone, keyGen, thirdWalletChkApi, areArraysEqual, currentTimeZoneDate } = require("../../helper/common");
const { ObjectID, ObjectId } = require("mongodb");
const env = process.env;
const { socketEmitConnect } = require("../view_model/Socketcon");
const { socketConnection, socket } = require("../../src/view_model/Socket");
const { connectWithGeneralDb, connectWithCricketDb, connectWithFootballDb, connectWithVendorDb } = require("../../config/mongodb_connections");
const createGameAccsModel = require("../../mongo_models_new/credexon_general/GameAccsSchema");
const createSettingsModel = require("../../mongo_models_new/credexon_general/SettingSchema");
const createCktTeamMetaDataModel = require("../../mongo_models_new/credexon_cricket/CktTeamMetaDataSchema");
const createCktTeamsModel = require("../../mongo_models_new/credexon_cricket/CktTeamsSchema");
const createCktCommentaryModel = require("../../mongo_models_new/credexon_cricket/CktCommentarySchema");
const createCktTeamFantasyPointsModel = require("../../mongo_models_new/credexon_cricket/CktTeamFantasyPointsSchema");
const createCktPlayerMetaDataModel = require("../../mongo_models_new/credexon_cricket/CktPlayerMetaDataSchema");
const createCktLeaguesModel = require("../../mongo_models_new/credexon_cricket/CktLeaguesSchema");
const createUpcomingCricketModel = require("../../mongo_models_new/credexon_cricket/UpcomingCricketsSchema");
const createCktSeriesTeamBowlStatsModel = require("../../mongo_models_new/credexon_cricket/CktSeriesTeamBowlStatsSchema");
const createCricketPlayersModel = require("../../mongo_models_new/credexon_cricket/CktPlayerDetailsSchema");
const createCktPlayerStatesModel = require("../../mongo_models_new/credexon_cricket/CktPlayerStatesSchema");
const createCktSeriesTeamModel = require("../../mongo_models_new/credexon_cricket/CktSeriesTeamSchema");
const createCktSeriesMetaDataModel = require("../../mongo_models_new/credexon_cricket/CktSeriesMetaDataSchema");
const createCktPlayersFantasyPointsModel = require("../../mongo_models_new/credexon_cricket/CktPlayersFantasyPointsSchema");
const createCktPlayersModel = require("../../mongo_models_new/credexon_cricket/CktPlayersSchema");
const createCktMatchScoresModel = require("../../mongo_models_new/credexon_cricket/CktMatchScoresSchema");
const createCktSeriesTeamBatStatsModel = require("../../mongo_models_new/credexon_cricket/CktSeriesTeamBatStatsSchema");
const createCktIccRankingModel = require("../../mongo_models_new/credexon_cricket/CktIccRankingSchema");
const createFbTeamStatesModel = require("../../mongo_models_new/credexon_football/FbTeamStatesSchema");
const createFbPlayersModel = require("../../mongo_models_new/credexon_football/FbPlayersSchema");
const createFbSeriesTeamStatsModel = require("../../mongo_models_new/credexon_football/FbSeriesTeamStatsSchema");
const createFbTeamMetaDatasModel = require("../../mongo_models_new/credexon_football/FbTeamMetaDatasSchema");
const createFbScoresModel = require("../../mongo_models_new/credexon_football/FbScoresSchema");
const createFbHighlightVideoModel = require("../../mongo_models_new/credexon_football/FbHighlightVideoSchema");
const createFbPlayerDetailsModel = require("../../mongo_models_new/credexon_football/FbPlayerDetailsSchema");
const createFbCountriesModel = require("../../mongo_models_new/credexon_football/FbCountriesSchema");
const createFbCommentaryModel = require("../../mongo_models_new/credexon_football/FbCommentarySchema");
const createFbSeriesTeamModel = require("../../mongo_models_new/credexon_football/FbSeriesTeamSchema");
const createFbPlayerFantasyPointsModel = require("../../mongo_models_new/credexon_football/FbPlayerFantasyPointsSchema");
const createFbPlayerStatisticsDetailModel = require("../../mongo_models_new/credexon_football/FbPlayerStatisticsDetailSchema");
const createFbLeaguesModel = require("../../mongo_models_new/credexon_football/FbLeaguesSchema");
const createFbTeamsModel = require("../../mongo_models_new/credexon_football/FbTeamsSchema");
const createJoinMatchContestsModel = require("../../mongo_models_new/credexon_vendor/JoinMatchContestsSchema");
const createJoinAccPlayersModel = require("../../mongo_models_new/credexon_vendor/JoinAccPlayersSchema");
const createJoinAccTeamsModel = require("../../mongo_models_new/credexon_vendor/JoinAccTeamsSchema");
const createPoolModel = require("../../mongo_models_new/credexon_vendor/PoolSchema");
const createUserPlayerMatchCktsModel = require("../../mongo_models_new/credexon_vendor/UserPlayerMatchCktsSchema");
const createUserPlayerMatchFbsModel = require("../../mongo_models_new/credexon_vendor/UserPlayerMatchFbsSchema");
const createUserPlayersCktModel = require("../../mongo_models_new/credexon_vendor/UserPlayersSeriesCktSchema");
const createUserPlayersFbModel = require("../../mongo_models_new/credexon_vendor/UserPlayersSeriesFbSchema");
const createUserTeamCktModel = require("../../mongo_models_new/credexon_vendor/UserTeamCktSchema");
const createUserTeamFbModel = require("../../mongo_models_new/credexon_vendor/UserTeamFbSchema");
const createUserCktSeriesTeamModel = require("../../mongo_models_new/credexon_vendor/UserCktSeriesTeamSchema");
const createUserFbLeagueModel = require("../../mongo_models_new/credexon_vendor/UserFbSeriesTeamSchema");
const createFbUpcomingsModel = require("../../mongo_models_new/credexon_football/FbUpcomingsSchema");
const createSeriesJoinContestsModel = require("../../mongo_models_new/credexon_vendor/JoinSeriesContestsSchema");
const createUsersModel = require("../../mongo_models_new/credexon_vendor/UsersSchema");
const createTransactionsModel = require("../../mongo_models_new/credexon_vendor/TransactionsSchema");
const createCricketPlayerDetailsModel = require("../../mongo_models_new/credexon_cricket/CktPlayerDetailsSchema");
const createCktLeaguesPubModel = require("../../mongo_models_new/credexon_vendor/CktLeaguesPubSchema");
const createFbLeaguesPubModel = require("../../mongo_models_new/credexon_vendor/FbLeaguesPubSchema");
const createFbLeaguesSeasonsModel = require("../../mongo_models_new/credexon_football/FbLeagueSeasonsSchema");
const createFbLeagueDetailsModel = require("../../mongo_models_new/credexon_football/FbLeagueDetailsSchema");
const createContestSeriesModel = require("../../mongo_models_new/credexon_vendor/ContestSeriesSchema");


module.exports = {
    publish_active_match_list: async (req, res, next) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const CktTeamMetaDataSchema = createCktTeamMetaDataModel(cktDbConnection);
            const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);

            const params = req.body
            const page = parseInt(req.query.page || 1)
            let limit = parseInt(req.query.limit || 10);
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;

            params.rstatus = parseInt(params.rstatus);
            limit = (params.rstatus === 3) ? 20 : limit;
            let d_sort = (params.rstatus === 3) ? -1 : 1;
            let sort_match = (params.rstatus === 3) ? { date_start_ist: d_sort } : { date_start_ist: d_sort };

            let rStatus = (params.rstatus === 3) ? { "$in": [3, 4] } : params.rstatus;
            let dbkey = keyGen(req.user.apikey);

            //limit and pagination 
            let match_list = await UpcomingCricketsSchema.find({
                rstatus: rStatus,
                ["is_active" + dbkey]: 1,
                ["is_publish" + dbkey]: 1
            }).sort(sort_match).skip(startIndex).limit(limit);

            //let newMatchList = []

            let newMatchList = await Promise.all(match_list.map(async (item) => {
                return new Promise(async (resolve, reject) => {
                    let teamMeta = await CktTeamMetaDataSchema.find({
                        team_id: { "$in": [item.teama.team_id, item.teamb.team_id] }
                    })

                    let teamDetailMetaA = teamMeta.filter(x => x.team_id == item.teama.team_id);
                    teamDetailMetaA = teamDetailMetaA && teamDetailMetaA[0];

                    let teamDetailMetaB = teamMeta.filter(x => x.team_id == item.teamb.team_id);
                    teamDetailMetaB = teamDetailMetaB && teamDetailMetaB[0];

                    let objTeam = {
                        _id: item._id,
                        match_id: item.match_id,
                        title: item.title,
                        match_status: item.rstatus,
                        date_start: dateTimeZone(item.date_start_ist, req.user.timezone),//timeChange(req.user.id,item.date_start_ist),
                        date_end: item.date_end_ist,
                        short_title: item.short_title,
                        teama_id: item.teama.team_id,
                        teama_name: item.teama.name,
                        teama_short_name: (teamDetailMetaA && teamDetailMetaA.short_name) ? teamDetailMetaA.short_name : item.teama.short_name,

                        teama_logo: (teamDetailMetaA && teamDetailMetaA.logo_url) ? `${env.awsimgurl}profile_doc/${teamDetailMetaA.logo_url}` : item.teama.logo_url,
                        teamb_id: item.teamb.team_id,
                        teamb_name: item.teamb.name,
                        teamb_short_name: (teamDetailMetaB && teamDetailMetaB.short_name) ? teamDetailMetaB.short_name : item.teamb.short_name,
                        teamb_logo: (teamDetailMetaB && teamDetailMetaB.logo_url) ? `${env.awsimgurl}profile_doc/${teamDetailMetaB.logo_url}` : item.teamb.logo_url,
                        league_name: item.competition.title,
                        is_playing11: item.is_playing11

                    }

                    //newMatchList.push(objTeam)
                    resolve(objTeam);
                })

            }))

            //count 
            let total_count = await UpcomingCricketsSchema.find({
                rstatus: params.rstatus,
                ["is_active" + dbkey]: 1,
                ["is_publish" + dbkey]: 1
            }).count()

            //newMatchList = sortingData(newMatchList, "date_start", d_sort)

            return res.send(response({
                total_count: total_count,
                status_key: params.rstatus,
                match_list: newMatchList,
                status: match_list.length > 0 ? true : false,

            }, match_list.length > 0 ? "Publish Match view succesfully.!!!" : "No data found.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    publish_active_football_list: async (req, res, next) => {
        try {
            const footballDbConnection = await connectWithFootballDb();
            const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);
            const FbTeamMetaDatasSchema = createFbTeamMetaDatasModel(footballDbConnection);

            const params = req.body
            const page = parseInt(req.query.page || 1)
            let limit = parseInt(req.query.limit || 25);
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;

            limit = (params.rstatus === 3) ? 10 : limit;
            let d_sort = (params.rstatus === 3) ? -1 : 1;
            let dbkey = keyGen(req.user.apikey);

            //limit and pagination 
            let football_list = await FbUpcomingsSchema.find({
                rstatus: params.rstatus,
                ["is_active" + dbkey]: 1,//Todo: Need to remove dbkey
                ["is_publish" + dbkey]: 1,//Todo: Need to remove dbkey

            },
            ).sort({ date_start_ist: d_sort }).skip(startIndex).limit(limit)

            let newFootballList = []

            await Promise.all(football_list.map(async (item) => {
                let teamMeta = await FbTeamMetaDatasSchema.find({
                    team_id: { "$in": [item.teama.team_id, item.teamb.team_id] }
                })

                let teamDetailMetaA = teamMeta.filter(x => x.team_id == item.teama.team_id);
                teamDetailMetaA = teamDetailMetaA && teamDetailMetaA[0];

                let teamDetailMetaB = teamMeta.filter(x => x.team_id == item.teamb.team_id);
                teamDetailMetaB = teamDetailMetaB && teamDetailMetaB[0];
                newFootballList.push(
                    {
                        _id: item._id,
                        match_id: item.match_id,
                        date_start: item.date_start_ist,
                        local_name: item.localTeam.data.name,
                        local_logo_path: (teamDetailMetaA && teamDetailMetaA.logo_url) ? `${env.awsimgurl}profile_doc/${teamDetailMetaA.logo_url}` : item.localTeam.data.logo_path,
                        visit_name: item.visitorTeam.data.name,
                        visit_logo_path: (teamDetailMetaB && teamDetailMetaB.logo_url) ? `${env.awsimgurl}profile_doc/${teamDetailMetaB.logo_url}` : item.visitorTeam.data.logo_path,
                        league_name: item.league_name,
                        teama_id: item.teama.team_id,
                        teamb_id: item.teamb.team_id,
                        is_playing11: item.is_playing11
                    }
                )

            }))


            //count 
            let total_count = await FbUpcomingsSchema.find({
                rstatus: params.rstatus,
                ["is_active" + dbkey]: 1,
                ["is_publish" + dbkey]: 1,
            }).count()

            newFootballList = sortingData(newFootballList, "date_start", d_sort)

            return res.send(response({
                total_count: total_count,
                status_key: params.rstatus,
                football_list: newFootballList,
                status: football_list.length > 0 ? true : false,

            }, football_list.length > 0 ? "Publish Football view succesfully.!!!" : "No data found.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    player_list: async (req, res, next) => {
        try {
            const generalDbConnection = await connectWithGeneralDb();
            const SettingSchema = createSettingsModel(generalDbConnection);
            const cktDbConnection = await connectWithCricketDb();
            const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);
            const CktPlayersSchema = createCktPlayersModel(cktDbConnection);

            const footballDbConnection = await connectWithFootballDb();
            const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);

            const params = req.body;
            const user = req.user
            let page = parseInt(req.query.page || 1)
            let limit = parseInt(req.query.limit || 10);
            let startIndex = (page - 1) * limit;
            let endIndex = page * limit;
            if (params.type == "Cricket") {
                //limit and pagination
                // let cricketplayerdetail = await cricketsplayers.find({
                //     match_id: params.match_id

                // }).skip(startIndex).limit(limit).lean();
                let filter = {}
                filter["match_id"] = params.match_id;
                if (params.player_name) {
                    filter = {
                        first_name: new RegExp((params.player_name))
                    }
                }

                let matchDetail = await UpcomingCricketsSchema.findOne({ "match_id": params.match_id })
                let teamAId = matchDetail?.teama?.team_id;
                let teamBId = matchDetail?.teamb?.team_id;

                let teamACountry = matchDetail?.teama?.short_name;
                let teamBCountry = matchDetail?.teamb?.short_name;

                let playerList = await CktPlayersSchema.aggregate(
                    [
                        {
                            $match: filter
                        },
                        // {
                        //     "$group": {
                        //         "_id": { pid: "$pid" },
                        //         "pid": { "$first": "$pid" }, "first_name": { "$first": "$first_name" }
                        //         , "tid": { "$first": "$tid" }, "fantasy_player_rating": { "$first": "$fantasy_player_rating" }, "bowling_style": { "$first": "$bowling_style" }
                        //         , "batting_style": { "$first": "$batting_style" }, "playing_role": { "$first": "$playing_role" }, "is_playing": { "$first": "$is_playing" },
                        //         "selectedBy": { "$first": "$selectedBy" },
                        //         "pid": { "$first": "$pid" }, "logo_url": { "$first": "$player_detail.logo_url" }, "jersy_no": { "$first": "$player_detail.jersy_no" },
                        //         "country": { "$first": "$country" }

                        //     }
                        // },
                        {
                            $lookup:
                            {
                                from: "ckt_player_details",
                                localField: "pid",
                                foreignField: "pid",
                                as: "player_detail",
                            },
                        },
                        {
                            $unwind: {
                                "path": "$player_detail",
                                "preserveNullAndEmptyArrays": true
                            }
                        },
                        {
                            $lookup:
                            {
                                from: "cktplymetadatas",
                                localField: "pid",
                                foreignField: "pid",
                                as: "player_meta",
                            },
                        },
                        {
                            $unwind: {
                                "path": "$player_meta",
                                "preserveNullAndEmptyArrays": true
                            }
                        },
                        {
                            $project: {
                                "pid": "$pid", "first_name": "$player_detail.first_name",
                                "fantasy_player_rating": "$player_detail.fantasy_player_rating", "bowling_style": "$player_detail.bowling_style", "batting_style": "$player_detail.batting_style", "playing_role": "$player_detail.playing_role", "selectedBy": "$selectedBy",
                                "avg_point": "$player_meta.avg_point", "logo_url": "$player_meta.logo_url", "jersy_no": "$player_meta.jersy_no",
                                "tid": "$tid", "is_playing": "$is_playing", "country": "$player_detail.country"
                            }
                        },
                        { "$sort": { "pid": -1 } },



                    ]);

                let isPlys = 1;
                if (playerList && playerList.length > 0) {

                } else {
                    let matchA = await CktPlayersSchema.findOne({ tid: teamAId }, { match_id: 1 })
                    let matchB = await CktPlayersSchema.findOne({ tid: teamBId }, { match_id: 1 })

                    if (matchA && matchB) {


                        isPlys = 0;
                        filter["match_id"] = { "$in": [matchA.match_id, matchB.match_id] }
                        filter["tid"] = { "$in": [teamAId, teamBId] }

                        playerList = await CktPlayersSchema.aggregate(
                            [
                                {
                                    $match: filter
                                },
                                { "$sort": { "pid": -1 } },
                                {
                                    $lookup:
                                    {
                                        from: "ckt_player_details",
                                        localField: "pid",
                                        foreignField: "pid",
                                        as: "player_detail",
                                    },
                                },
                                {
                                    $unwind: {
                                        "path": "$player_detail",
                                        "preserveNullAndEmptyArrays": true
                                    }
                                },
                                {
                                    $lookup:
                                    {
                                        from: "cktplymetadatas",
                                        localField: "pid",
                                        foreignField: "pid",
                                        as: "player_meta",
                                    },
                                },
                                {
                                    $unwind: {
                                        "path": "$player_meta",
                                        "preserveNullAndEmptyArrays": true
                                    }
                                },
                                {
                                    $project: {
                                        "pid": "$pid", "first_name": "$player_detail.first_name",
                                        "fantasy_player_rating": "$player_detail.fantasy_player_rating", "bowling_style": "$player_detail.bowling_style", "batting_style": "$player_detail.batting_style", "playing_role": "$player_detail.playing_role", "selectedBy": "$selectedBy",
                                        "avg_point": "$player_detail.avg_point", "logo_url": "$player_detail.logo_url", "jersy_no": "$player_detail.jersy_no",
                                        "tid": "$tid", "is_playing": "$is_playing", "country": "$player_detail.country"
                                    }
                                },
                                

                            ]);
                    }

                }

                let plyListA = [];
                let plyListB = [];
                for (let p = 0; p < playerList.length; p++) {
                    let plyObj = {
                        player_id: playerList[p]["pid"],
                        player_name: playerList[p]["first_name"],
                        playing_role: playerList[p]["playing_role"],
                        batting_style: playerList[p]["batting_style"],
                        bowling_style: playerList[p]["bowling_style"],
                        is_playing: (isPlys === 0) ? 2 : playerList[p]["is_playing"],
                        rating: playerList[p]["fantasy_player_rating"],
                        avg_point: playerList[p]["avg_point"],
                        player_image: (playerList[p]["logo_url"]) ? `${env.awsimgurl}profile_doc/${playerList[p]["logo_url"]}` : "",
                        jersy_no: playerList[p]["jersy_no"],
                        country: playerList[p]["country"],
                    }
                    if (teamAId === playerList[p]["tid"]) {
                        plyObj["team_id"] = matchDetail?.teama?.team_id;
                        plyObj["team_name"] = matchDetail?.teama?.name;
                        plyObj["team_short_name"] = matchDetail?.teama?.short_name;
                        plyListA.push(plyObj)
                    }

                    if (teamBId === playerList[p]["tid"]) {
                        plyObj["team_id"] = matchDetail?.teamb?.team_id;
                        plyObj["team_name"] = matchDetail?.teamb?.name;
                        plyObj["team_short_name"] = matchDetail?.teamb?.short_name;
                        plyListB.push(plyObj)
                    }
                }

                // let teamACountry=plyListA[0]["country"];
                // let teamBCountry=plyListB[0]["country"];

                const cktDbConnection = await connectWithCricketDb();
                const CktTeamMetaDataSchema = createCktTeamMetaDataModel(cktDbConnection);

                let teamMeta = await CktTeamMetaDataSchema.find({
                    team_id: { "$in": [teamAId, teamBId] }
                })

                let teamDetailMetaA = teamMeta.filter(x => x.team_id == teamAId);
                teamDetailMetaA = teamDetailMetaA && teamDetailMetaA[0];

                let teamDetailMetaB = teamMeta.filter(x => x.team_id == teamBId);
                teamDetailMetaB = teamDetailMetaB && teamDetailMetaB[0];

                let data = {
                    //_id: item._id,
                    match_id: params.match_id,
                    cid: matchDetail?.cid,
                    is_playing: matchDetail?.is_players,
                    teama_id: matchDetail.teama.team_id,
                    teamb_id: matchDetail.teamb.team_id,
                    teama_name: matchDetail.teama.name,
                    teama_short_name: matchDetail.teama.short_name,
                    teama_logo_url: (teamDetailMetaA && teamDetailMetaA.logo_url) ? `${env.awsimgurl}profile_doc/${teamDetailMetaA.logo_url}` : matchDetail.teama.logo_url,
                    teama_country_name: teamACountry,
                    teama_players: plyListA,
                    teamb_name: matchDetail.teamb.name,
                    teamb_short_name: matchDetail.teamb.short_name,
                    teamb_logo_url: (teamDetailMetaB && teamDetailMetaB.logo_url) ? `${env.awsimgurl}profile_doc/${teamDetailMetaB.logo_url}` : matchDetail.teamb.logo_url,
                    teamb_country_name: teamBCountry,
                    teamb_players: plyListB
                }

                // let data =await Promise.all(cricketplayerdetail.map(async (item) => {
                //    return new Promise(async(resolve,reject)=>{
                //     let plyListA = [];
                //     item.teama.players.map(async (item2, i) => {

                //         const plyMeta = await cktplymetadataSchema.findOne({
                //             pid: item2.pid,
                //         })
                //         plyListA.push({
                //             team_id: item.teama.team.tid,
                //             team_name: item.teama.team.title,
                //             team_short_name: item.teama.team.abbr,
                //             player_id: item2.pid,
                //             player_name: item2.title,
                //             playing_role: item2.playing_role,
                //             batting_style: item2.batting_style,
                //             bowling_style: item2.bowling_style,
                //             is_playing: item2.is_playing,
                //             rating: item2.fantasy_player_rating,
                //             avg_point: "",
                //             player_image: (plyMeta && plyMeta.logo_url) ? `${env.awsimgurl}profile_doc/${plyMeta.logo_url}` : "",
                //             jersy_no: (plyMeta && plyMeta.jersy_no)
                //         }
                //         )
                //     })
                //     let plyListB = [];
                //     item.teamb.players.map(async (item3, i) => {
                //         const plyMetaB = await cktplymetadataSchema.findOne({
                //             pid: item3.pid,
                //         })

                //         plyListB.push({
                //             team_id: item.teamb.team.tid,
                //             team_name: item.teamb.team.title,
                //             team_short_name: item.teamb.team.abbr,
                //             player_id: item3.pid,
                //             player_name: item3.title,
                //             playing_role: item3.playing_role,
                //             batting_style: item3.batting_style,
                //             bowling_style: item3.bowling_style,
                //             is_playing: item3.is_playing,
                //             rating: item3?.fantasy_player_rating,
                //             avg_point: "",
                //             player_image: (plyMetaB && plyMetaB.logo_url) ? `${env.awsimgurl}profile_doc/${plyMetaB.logo_url}` : "",
                //             jersy_no: (plyMetaB && plyMetaB.jersy_no)
                //         }
                //         )
                //     })


                //     let teamMeta = await cktteammetadataSchema.find({
                //         team_id: { "$in": [item.teama.team_id, item.teamb.team_id] }
                //     })

                //     let teamDetailMetaA = teamMeta.filter(x => x.team_id == item.teama.team_id);
                //     teamDetailMetaA = teamDetailMetaA && teamDetailMetaA[0];

                //     let teamDetailMetaB = teamMeta.filter(x => x.team_id == item.teamb.team_id);
                //     teamDetailMetaB = teamDetailMetaB && teamDetailMetaB[0];

                //     resolve (
                //         {
                //             _id: item._id,
                //             match_id: item.match_id,
                //             cid: item.teama.cid,
                //             is_playing: item.is_playing11,
                //             teama_id: item.teama.team_id,
                //             teamb_id: item.teamb.team_id,
                //             teama_name: item.teama.team.title,
                //             teama_short_name: item.teama.team.abbr, 
                //             teama_logo_url: (teamDetailMetaA && teamDetailMetaA.logo_url) ? `${env.awsimgurl}profile_doc/${teamDetailMetaA.logo_url}` : item.teama.team.thumb_url,
                //             teama_country_name: item.teama.team.country,
                //             teama_players: plyListA,
                //             teamb_name: item.teamb.team.title,
                //             teamb_short_name: item.teamb.team.abbr, 
                //             teamb_logo_url:(teamDetailMetaB && teamDetailMetaB.logo_url) ? `${env.awsimgurl}profile_doc/${teamDetailMetaB.logo_url}` : item.teamb.team.thumb_url,
                //             teamb_country_name: item.teamb.team.country,
                //             teamb_players: plyListB
                //         }
                //     )
                // })
                // }))
                //count
                //let total_count = await cricketsplayers.find({ match_id: params.match_id }).count({})
                //let status = cricketplayerdetail.length > 0 ? true : false

                // if (cricketplayerdetail.length > 0) {
                //     let cid_detail = cricketplayerdetail[0].teamb.cid

                //     let cid = parseInt(cid_detail);

                //     let date_detail = await cktleague.findOne({ cid: cid })

                //     cricketplayerdetail[0].date_start = date_detail?.date_start

                // }

                let settings = await SettingSchema.findOne({})

                return res.send(response({
                    total_count: playerList.length,
                    cricketplayerdetail: [data],
                    date_start: dateTimeZone(matchDetail.date_start_ist, req.user.timezone),//timeChange(req.user.id,matchDetail.date_start_ist),
                    prize: settings.player_acc,
                    platform_fee: settings.platform_fees,
                }, playerList.length > 0 ? "Cricket Player list view succesfully.!!!" : "No data found.!!!", true))
            } else if (params.type == "Football") {
                const FbTeamMetaDatasSchema = createFbTeamMetaDatasModel(footballDbConnection);
                const FbPlayersSchema = createFbPlayersModel(footballDbConnection);

                let filter = {}
                //filter["match_id"] = params.match_id;
                if (params.player_name) {
                    filter = {
                        "player_detail.first_name": new RegExp((params.display_name))
                    }
                }

                let matchDetail = await FbUpcomingsSchema.findOne({ "match_id": params.match_id })
                let teamAId = matchDetail?.teama?.team_id;
                let teamBId = matchDetail?.teamb?.team_id;

                let teamACountry = matchDetail?.teama?.name;
                let teamBCountry = matchDetail?.teamb?.name;

                let playerList = await FbPlayersSchema.aggregate(
                    [
                        {
                            $match: { match_id: params.match_id }
                        },
                        {
                            $lookup:
                            {
                                from: "fb_player_details",
                                localField: "pid",
                                foreignField: "pid",
                                as: "player_detail",
                            },
                        },
                        {
                            $unwind: {
                                "path": "$player_detail",
                                "preserveNullAndEmptyArrays": true
                            }
                        },
                        {
                            $match: filter
                        },
                        {
                            $lookup:
                            {
                                from: "fb_players_meta_data",
                                localField: "pid",
                                foreignField: "pid",
                                as: "player_meta",
                            },
                        },
                        {
                            $unwind: {
                                "path": "$player_meta",
                                "preserveNullAndEmptyArrays": true
                            }
                        },
                        {
                            $project: {
                                "pid": "$pid", "first_name": "$player_detail.firstname",
                                "playing_role": "$player_detail.position_id", //"selectedBy": "$selectedBy",
                                "avg_point": "$player_meta.avg_point", "logo_url": "$player_detail.image_path", "meta_logo_url": "$player_meta.logo_url", "jersy_no": "$jersey_number",
                                "tid": "$tid", "is_playing": "$is_playing", "country": "$player_detail.country_id", "season_id": "$player_detail.season_id"
                            }
                        },
                        { "$sort": { "pid": -1 } },
                    ]);

                let isPlys = 1;

                let plyListA = [];
                let plyListB = [];
                for (let p = 0; p < playerList.length; p++) {
                    let plyObj = {
                        player_id: playerList[p]["pid"],
                        player_name: playerList[p]["first_name"],
                        playing_role: playerList[p]["playing_role"],
                        is_playing: (isPlys === 0) ? 2 : playerList[p]["is_playing"],
                        avg_point: playerList[p]["avg_point"],
                        player_image: (playerList[p]["meta_logo_url"]) ? `${env.awsimgurl}profile_doc/${playerList[p]["meta_logo_url"]}` : `${playerList[p]["logo_url"]}`,
                        jersy_no: playerList[p]["jersy_no"],
                        country: playerList[p]["country"],
                        season_id: playerList[p]["season_id"]
                    }
                    if (teamAId === playerList[p]["tid"]) {
                        plyObj["team_id"] = matchDetail?.teama?.team_id;
                        plyObj["team_name"] = matchDetail?.teama?.name;
                        plyObj["team_short_name"] = matchDetail?.teama?.short_name;
                        plyListA.push(plyObj)
                    }

                    if (teamBId === playerList[p]["tid"]) {
                        plyObj["team_id"] = matchDetail?.teamb?.team_id;
                        plyObj["team_name"] = matchDetail?.teamb?.name;
                        plyObj["team_short_name"] = matchDetail?.teamb?.short_name;
                        plyListB.push(plyObj)
                    }
                }

                let teamMeta = await FbTeamMetaDatasSchema.find({
                    team_id: { "$in": [teamAId, teamBId] }
                })

                let teamDetailMetaA = teamMeta.filter(x => x.team_id == teamAId);
                teamDetailMetaA = teamDetailMetaA && teamDetailMetaA[0];

                let teamDetailMetaB = teamMeta.filter(x => x.team_id == teamBId);
                teamDetailMetaB = teamDetailMetaB && teamDetailMetaB[0];

                let data = {
                    //_id: item._id,
                    match_id: params.match_id,
                    cid: matchDetail?.cid,
                    is_playing: matchDetail?.is_players,
                    teama_id: matchDetail.teama.team_id,
                    teamb_id: matchDetail.teamb.team_id,
                    teama_name: matchDetail.teama.name,
                    teama_short_name: matchDetail.teama.short_name,
                    teama_logo_url: (teamDetailMetaA && teamDetailMetaA.logo_url) ? `${env.awsimgurl}profile_doc/${teamDetailMetaA.logo_url}` : matchDetail.teama.logo_url,
                    teama_country_name: teamACountry,
                    teama_players: plyListA,
                    teamb_name: matchDetail.teamb.name,
                    teamb_short_name: matchDetail.teamb.short_name,
                    teamb_logo_url: (teamDetailMetaB && teamDetailMetaB.logo_url) ? `${env.awsimgurl}profile_doc/${teamDetailMetaB.logo_url}` : matchDetail.teamb.logo_url,
                    teamb_country_name: teamBCountry,
                    teamb_players: plyListB,
                    season_id: matchDetail.season_id
                }



                let settings = await SettingSchema.findOne({})
                return res.send(response({
                    total_count: playerList.length,
                    Footballplayerdetail: [data],
                    date_start: matchDetail.date_start_ist,
                    status: playerList.length > 0 ? true : false,
                    prize: settings.player_acc,
                    platform_fee: settings.platform_fees,
                }, playerList.length > 0 ? "Player list view succesfully.!!!" : "No data found.!!!", true))
            }
        } catch (error) {

            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    cricket_list: async (req, res, next) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const CktTeamsSchema = createCktTeamsModel(cktDbConnection);
            const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);
            const CktSeriesMetaDataSchema = createCktSeriesMetaDataModel(cktDbConnection);
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const CktLeaguesPubSchema=createCktLeaguesPubModel(vendorDbConnection);

            const params = req.body;
            const user = req.user

            let page = parseInt(req.query.page || 1)
            let limit = parseInt(req.query.limit || 10);
            let startIndex = (page - 1) * limit;
            let endIndex = limit;

            //limit and pagination 
            let currentDates = currentTimeZoneDate();
            let condition = {};

            if(params.status === "upcoming"){
                condition={
                    "$or": [{ status: 'upcoming' }, {
                        status: 'live',
                        //date_start: { "$lt": currentDates },
                        date_end: { "$gt": currentDates }
                    }], "is_active": 1, "is_publish": 1
                };
            }else 
            {
                condition={ status: params.status, "is_active": 1, "is_publish": 1 };
            }

            let cricketPubList = await CktLeaguesPubSchema.distinct("cid",condition);
            let cricket_list = await CktLeaguesSchema.find({"cid":{"$in":cricketPubList}}, { cid: 1, date_end: 1, date_start: 1, name: 1, logo_url: 1, status: 1 }).skip(startIndex).limit(endIndex).sort({ date_start: -1 }).lean();
            console.log("cricket_list-->>",cricketPubList,cricket_list)
            cricket_list = cricket_list.map((item) => {

                if (item.logo_url) {

                    let checkhttpurl = isValidHttpUrl(item.logo_url)

                    if (checkhttpurl) {
                        item.image = item.logo_url
                    } else {
                        item.image = `${env.awsimgurl}profile_doc/${item.logo_url}`
                    }
                }

                item.date_start = (params.status === "upcoming" && item.status === "live") ? currentDates : item.date_start;
                return (item)
            })
            

            if (cricket_list.length > 0) {
                dataList = await Promise.all(cricket_list.map(async (item) => {
                    item.series_team_count = await CktTeamsSchema.countDocuments({ cid: item.cid })
                    return item
                }))

                dataList = await Promise.all(cricket_list.map(async (item) => {
                    let itemLogo = await CktSeriesMetaDataSchema.findOne({ league_id: item.cid });
                    if (itemLogo) {
                        return item.image = `${env.awsimgurl}profile_doc/${itemLogo.logo_url}`
                    }
                }))
            }


            //count 
            let total_count = await CktLeaguesPubSchema.countDocuments({
                status: params.status, "is_active": 1, "is_publish": 1
            })


            //let status = cricket_list.length > 0 ? true : false
            return res.send(response({
                total_count: total_count,
                status_key: params.status,
                cricket_list: cricket_list,
            }, cricket_list.length > 0 ? "Cricket list view succesfully.!!!" : "No data found.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    football_list: async (req, res, next) => {
        try {
            const footballDbConnection = await connectWithFootballDb();
            const FbLeaguesSchema = createFbLeaguesModel(footballDbConnection);
            const FbTeamsSchema = createFbTeamsModel(footballDbConnection);
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const FbLeaguesPubSchema=createFbLeaguesPubModel(vendorDbConnection);
            const FbLeaguesSeasonsSchema=createFbLeaguesSeasonsModel(footballDbConnection);

            const params = req.body;
            const user = req.user
            let page = parseInt(req.query.page || 1)
            let limit = parseInt(req.query.limit || 10);
            let startIndex = (page - 1) * limit;
            let endIndex = page * limit;
            //limit and pagination 

            
            console.log("params--->>",params)
            let footballMIdlist = await FbLeaguesPubSchema.find({
                status: {"$in":["upcoming","live"]},
                "is_active": 1, "is_publish": 1
                // is_current_season: true
            },{"id":1}

                //{ _id: 1, id: 1, date_start: 1, date_end: 1, logo_path: 1, name: 1, season_id: 1, short_code: 1 }
            ).skip(startIndex).limit(limit).sort({ date_start: -1 }).lean();

            let mIdList=[];
            footballMIdlist.forEach(item=>{
                mIdList.push(item.id);
            })
            console.log("mIdList-->>",mIdList);

            let football_list = await FbLeaguesSeasonsSchema.aggregate([{"$match":{"season_id":{"$in":mIdList}}},
                {
                    $lookup:
                    {
                        from: "fb_league_details",
                        localField: "league_id",
                        foreignField: "id",
                        as: "league_details",
                    },
                },
                {
                    $unwind: {
                        "path": "$league_details",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$project":{ _id: 1, id: "$season_id", date_start: "$date_start_ist", date_end: "$date_end_ist", logo_path: "$league_details.logo_path", name: "$league_details.short_code", season_id: "$season_id", short_code: "$league_details.short_code" }
                }
            ]);

            console.log("football_list--->>",football_list)

            football_list = football_list.map((item) => {

                let checkhttpurl = isValidHttpUrl(item.logo_path)
                if (checkhttpurl) {
                    item.image = item.logo_path
                } else {
                    item.image = `${env.awsimgurl}profile_doc/${item.logo_path}`
                }
                return (item)
            })

            if (football_list.length > 0) {
                dataList = await Promise.all(football_list.map(async (item) => {
                    item.series_team_count = await FbTeamsSchema.countDocuments({ season_id: item.season_id })
                    return item
                }))
            }


            //count 
            let total_count = await FbLeaguesPubSchema.countDocuments({
                status: {"$in":["upcoming","live"]}, "is_active": 1, "is_publish": 1,
                //is_current_season: true
            }) // Todo: need to remove dbkey

            let status = football_list.length > 0 ? true : false

            return res.send(response({
                total_count: total_count,
                status_key: params.status,
                football_list: football_list,
            }, football_list.length > 0 ? "Football list view succesfully.!!!" : "No data found.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },

    add_prize_pool: async (req, res, next) => {
        try {
            let body_detail = req.body;
            body_detail.data.map(async (item) => {
                let send_array = { match_id: body_detail.match_id, userid: req.user.id, team_id: item.team_id, price: item.price, quality: item.quality }
                await prizepoolaccumulator.create(send_array);
                return 'sucess'
            })
            return res.send(response({}, "Add Prize Pool Successfully!.", true));
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    add_team: async (req, res, next) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const JoinAccTeamsSchema = createJoinAccTeamsModel(vendorDbConnection);

            let body_detail = req.body;
            body_detail.data.map(async (item) => {
                let send_array = { league_id: body_detail.league_id, userid: req.user.id, team_id: item.team_id, pamount: item.pamount, sharecnt: item.sharecnt, gametype: body_detail.gametype, gamekey: body_detail.gamekey }
                await JoinAccTeamsSchema.create(send_array);
                return 'sucess'
            })
            return res.send(response({}, "Add Accumulator Successfully!.", true));

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    add_ply_accumulator: async (req, res, next) => {
        try {
            
            const generalDbConnection = await connectWithGeneralDb();
            const SettingSchema = createSettingsModel(generalDbConnection);

            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const JoinAccPlayersSchema = createJoinAccPlayersModel(vendorDbConnection);
            const JoinAccTeamsSchema = createJoinAccTeamsModel(vendorDbConnection);
             
            const UsersSchema = createUsersModel(vendorDbConnection);
            const TransactionsSchema = createTransactionsModel(vendorDbConnection);

            let params = req.body;
            params.userid = ObjectId(req.user.id);
            let condition ={};
            let type="";
            if(params?.match_id){
                type="m";
                condition={"match_id":parseInt(params.match_id)};
            }else 
            if(params?.league_id){
                type="s";
                condition={"league_id":parseInt(params.league_id)};
            }
            
            if (params.gamekey == "fb") {
                const footballDbConnection = await connectWithFootballDb();
                let fbUpcomingSchema=null;
                if(type=="m"){
                    const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);
                    fbUpcomingSchema=FbUpcomingsSchema;
                }else{
                    const FbLeaguesSeasonsSchema = createFbLeaguesSeasonsModel(footballDbConnection);
                    fbUpcomingSchema=FbLeaguesSeasonsSchema;
                }
                
                let matchDetail = await fbUpcomingSchema.findOne(condition);

                let currentDates = currentTimeZoneDate() * 1 / 1000;
                let matchDate = matchDetail?.date_start_ist * 1 / 1000;
                if (matchDate < currentDates) {
                    return res.send(response({}, "Match is live now. You cannot join", false))
                }


            } else {
                const cktDbConnection = await connectWithCricketDb();
            

                let cktUpcomingSchema=null;
                if(type=="m"){
                    const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);
                    cktUpcomingSchema=UpcomingCricketsSchema;
                }else{
                    const CktLeaguesSchema=createCktLeaguesModel(cktDbConnection);
                    cktUpcomingSchema=CktLeaguesSchema;
                }
                let matchDetail = await cktUpcomingSchema.findOne(condition);

                let currentDates = currentTimeZoneDate() * 1 / 1000;
                let matchDate =((type=="m")? matchDetail?.date_start_ist:matchDetail?.date_start) * 1 / 1000;
                if (matchDate < currentDates) {
                    return res.send(response({}, "Match is live now. You cannot join", false))
                }
            }
            let gtype = "";
            let joinContSchema = null;
            let gameamt = "";
            let getFeeKey = "";
            //[plyacc, mplycont, buysell, splycont, tmacc, pzpool, tmcont, optn, longtrm, ipo]
            if (params.gamekey == "plyacc") {
                gtype = "plyacc";
                joinContSchema = JoinAccPlayersSchema;
                gameamt = "gkamount";
                getFeeKey = "player_acc";
            }
            else if (params.gamekey == "tmacc") {
                gtype = "tmacc";
                joinContSchema = JoinAccTeamsSchema;
                gameamt = "pamount";
                getFeeKey = "team_acc";
            }
            else if (params.gamekey == "pzpool") {
                gtype = "pzpool";
                joinContSchema = JoinAccTeamsSchema;
                gameamt = "pamount";
                getFeeKey = "prize_pool";
            }


            let findSetting = await SettingSchema.findOne({});
            let feeAmt = findSetting[getFeeKey]
            let amtCheck = 0;
            await params.data.map(async (item) => {
                amtCheck = amtCheck + (feeAmt * item.sharecnt)
            })

            //let pool_list = await pool.findOne({ _id: params.poolid })

            ///////////////////

            let settingsSchema = await SettingSchema.findOne();
            let platformfeeAdmin = settingsSchema["platform_fees"];

            let bnsAdmin = settingsSchema["usable_bonus_percentage"];

            amtCheck = amtCheck + (amtCheck * platformfeeAdmin / 100);

            const userDetail = await UsersSchema.findOne({ _id: params.userid }, {'walletbalance':1, 'wltbns':1, 'wltwin':1, 'totaljoinfee':1, 'totaljoinfeedepots':1, 'totaljoinfeewin':1, 'phone':1});
            console.log("userDetail-->>",userDetail);
            params.isview = (params.isview === true) ? true : false;

            let calDeductBalResult = {};
            if (req.user.userType==2) {
                let thirdWalletChk = await thirdWalletChkApi(req.user.apikey, userDetail["phone"], amtCheck, params.isview);
                calDeductBalResult.status = (thirdWalletChk.code === 200) ? true : false;
                calDeductBalResult.remainingBal = thirdWalletChk.data.current_deposit;
                calDeductBalResult.remainingBns = thirdWalletChk.data.current_bonus;
                calDeductBalResult.remainingWin = thirdWalletChk.data.current_win;
                calDeductBalResult.deductBal = thirdWalletChk.data.deduct_deposit;
                calDeductBalResult.deductBns = thirdWalletChk.data.deduct_bonus;
                calDeductBalResult.deductWin = thirdWalletChk.data.deduct_win;
                calDeductBalResult.bnsTransString = "";
            } else {
                calDeductBalResult = await calDeductBal(amtCheck, bnsAdmin, userDetail["walletbalance"], userDetail["wltbns"], userDetail["wltwin"], params.userid, params.isview, req,vendorDbConnection);
            }


            let sumTotalJoinFee = userDetail["totaljoinfee"] + amtCheck;
            let sumTotalJoinFeeDepots = userDetail["totaljoinfeedepots"] + calDeductBalResult.deductBal;
            let sumTotalJoinFeeWin = userDetail["totaljoinfeewin"] + calDeductBalResult.deductWin;

            if (params.isview === true) {
                let sendResponse = {
                    joinfee: amtCheck,
                    walletbonous: calDeductBalResult.deductBns,
                    walletbalance: calDeductBalResult.deductBal,
                    walletwin: calDeductBalResult.deductWin,
                    bnsperc: bnsAdmin,
                    is_bal: calDeductBalResult.status
                }
                return res.send(response(sendResponse, (calDeductBalResult.status == true) ? "Please confirm" : "You don't have enough balance, please add an amount.", (calDeductBalResult.status == true) ? true : false));
            } else if (calDeductBalResult.status == true) {
                /////////////////////////
                ///Bonus ADD
                ///////////////////////////
                let bnsStringSplit = calDeductBalResult.bnsTransString.split(",");
                let stringBnsNew = "";
                bnsStringSplit.forEach((itemBns) => {
                    let bnsCk = parseFloat(itemBns.split("p")[1]) / (params.data.length);
                    stringBnsNew = stringBnsNew + (stringBnsNew ? "," : "") + itemBns.split("p")[0] + "p" + bnsCk
                })
                calDeductBalResult.bnsTransString = stringBnsNew;

                let subbnsFromFee = calDeductBalResult.deductBns / (params.data.length);
                let subaddWalBal = calDeductBalResult.deductBal / (params.data.length);
                let subwinFromFee = calDeductBalResult.deductWin / (params.data.length);

                await params.data.map(async (item) => {
                    let send_array = {};
                    if (params.gamekey == "plyacc") {
                        send_array = { match_id: params.match_id, userid: params.userid, pid: item.pid, [gameamt]: feeAmt, sharecnt: item.sharecnt, gametype: params.gametype, gamekey: params.gamekey, "platformfee": platformfeeAdmin }
                    }
                    else if (params.gamekey == "tmacc" || params.gamekey == "pzpool") {
                        send_array = { league_id: params.league_id, userid: params.userid, team_id: item.team_id, [gameamt]: feeAmt, sharecnt: item.sharecnt, gametype: params.gametype, gamekey: params.gamekey, "platformfee": platformfeeAdmin }
                    }

                    let resJoinCont = await joinContSchema.create(send_array)

                    if (resJoinCont._id) {
                        let jpoolID = resJoinCont._id.toString();
                        let currentDate = currentTimeZoneDate() * 1 / 1000;
                        if (subaddWalBal > 0) {
                            //[plyacc, mplycont, buysell, splycont, tmacc, pzpool, tmcont, optn, longtrm, ipo]

                            let objTransBal = { "userid": params.userid, "amount": subaddWalBal, "txdate": currentDate, "ttype": "dr", "gtype": gtype, "atype": "join_bal", "jpoolid": jpoolID };
                            await TransactionsSchema.create(objTransBal);
                        }

                        if (subbnsFromFee > 0) {
                            let objTransBns = { "userid": params.userid, "amount": subbnsFromFee, "txdate": currentDate, "ttype": "dr", "gtype": gtype, "atype": "join_bns", "jpoolid": jpoolID, "bnstring": calDeductBalResult.bnsTransString };
                            await TransactionsSchema.create(objTransBns);
                        }

                        if (subwinFromFee > 0) {
                            let objTransBns = { "userid": params.userid, "amount": subwinFromFee, "txdate": currentDate, "ttype": "dr", "gtype": gtype, "atype": "join_win", "jpoolid": jpoolID };
                            await TransactionsSchema.create(objTransBns);
                        }
                    }
                })


                await UsersSchema.update(
                    {
                        "_id": params.userid
                    },
                    {"$set":{
                        "walletbalance": calDeductBalResult.remainingBal, "wltbns": calDeductBalResult.remainingBns, "wltwin": calDeductBalResult.remainingWin,
                        "totaljoinfee": sumTotalJoinFee, "totaljoinfeedepots": sumTotalJoinFeeDepots, "totaljoinfeewin": sumTotalJoinFeeWin
                    }}
                );


                // else {
                //     return res.send(response({}, "Something went wrong.", false))
                // }
                return res.send(response({}, "Your shares added Successfully!.", true));
            } else {
                return res.send(response({}, "You don't have enough balance, please add an amount.", false))
            }

            ///////////////////
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    prize_pool_list: async (req, res) => {
        try {
            const generalDbConnection = await connectWithGeneralDb();
            const SettingSchema = createSettingsModel(generalDbConnection);

            const params = req.body;
            let page = parseInt(req.query.page || 1)
            let limit = parseInt(req.query.limit || 10);
            let startIndex = (page - 1) * limit;
            let endIndex = page * limit;

            let admin_setting = SettingSchema.findOne({}, { platform_fees: 1, prize_pool: 1 }); // Todo: Not using
            let settings = await SettingSchema.findOne({})

            if (params.type == "Cricket") {
                const cktDbConnection = await connectWithCricketDb();
                const CktTeamsSchema = createCktTeamsModel(cktDbConnection);
                const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);
                const CktSeriesMetaDataSchema = createCktSeriesMetaDataModel(cktDbConnection);

                const cktname = await CktLeaguesSchema.findOne({ cid: params.league_id })

                let checkhttpurl = isValidHttpUrl(cktname.logo_url)
                if (checkhttpurl) {
                    cktname.logo_url = cktname.logo_url
                } else {
                    cktname.logo_url = `${env.awsimgurl}profile_doc/${cktname.logo_url}`
                }
                let series_logo_url = cktname.logo_url

                let itemLogo = await CktSeriesMetaDataSchema.findOne({ league_id: params.league_id });


                letSendTeamData = {
                    title: cktname.name,
                    logo_url: (itemLogo && itemLogo.logo_url) ? `${env.awsimgurl}profile_doc/${itemLogo.logo_url}` : series_logo_url,
                    date_start: cktname.date_start
                }

                // const cktname = await cktleague.find({ cid: params.league_id })


                // let data2 = cktname.map((item2, i) => {
                //     return ({ name: item2.name })
                // })


                const cricketteam_list = await CktTeamsSchema.find({
                    cid: params.league_id
                }).lean();
                //.skip(startIndex).limit(limit)



                let data = cricketteam_list.map((item) => {

                    return ({
                        _id: item._id,
                        league_id: item.cid,
                        team_id: item.team.tid,
                        team_name: item.team.title,
                        team_short_name: item.team.abbr,
                        team_logo_url: item.team.thumb_url,
                        // team_logo_url:item.team.logo_url,
                        team_country_name: item.team.country,

                    })
                }
                )
                // })
                // count 
                let total_count = await CktTeamsSchema.countDocuments({ cid: params.league_id })
                //let status = cricketteam_list.length > 0 ? true : false




                // let data2_detail = "";
                // if (data2.length > 0) {
                //     data2_detail = data2[0].name
                // }

                return res.send(response({
                    total_count: total_count,
                    matchDetail: letSendTeamData,
                    prize: settings.prize_pool,
                    platform_fee: settings.platform_fees,
                    team_list: data,

                }, cricketteam_list.length > 0 ? "pool list view succesfully.!!!" : "No data found.!!!", true))

                // if (total_count > 4) {
                //     return res.send(response({
                //         total_count: total_count,
                //         header_name: data2_detail,
                //         team_list: data,
                //         platform_fee: 5
                //     }, cricketteam_list.length > 0 ? "Team list view succesfully.!!!" : "No data found.!!!", true))
                // } else {
                //     return res.status(400).send({ message: "Not sufficient Count" })
                // }
            } else if (params.type == "Football") {
                const footballDbConnection = await connectWithFootballDb();
                const FbLeaguesSchema = createFbLeaguesModel(footballDbConnection);
                const FbTeamsSchema = createFbTeamsModel(footballDbConnection);

                const fbname = await FbLeaguesSchema.findOne({ season_id: params.league_id })


                let checkhttpurl = isValidHttpUrl(fbname.logo_path)
                if (checkhttpurl) {
                    fbname.logo_path = fbname.logo_path
                } else {
                    fbname.logo_path = `${env.awsimgurl}profile_doc/${fbname.logo_path}`
                }
                let series_logo_url = fbname.logo_path

                letSendTeamData = {
                    title: fbname.name,
                    logo_url: series_logo_url,
                    date_start: fbname.date_start
                }
                // const fbname = await footballLeagueSchema(req.user.apikey).find({
                //     season_id: params.league_id
                // })

                // let data2 = fbname.map((item2, i) => {
                //     return ({
                //         name: item2.name
                //     })
                // })
                const footballteam_list = await FbTeamsSchema.find({
                    season_id: params.league_id
                }).skip(startIndex).limit(limit).lean();




                let data = footballteam_list.map((item) => {

                    return ({
                        _id: item._id,
                        league_id: item.season_id,
                        team_id: item.team_id,
                        team_name: item.name,
                        team_short_name: item.short_code,
                        team_logo_url: item.logo_path,

                        team_country_name: "",
                    })
                })

                let total_count = await FbTeamsSchema.countDocuments({ season_id: params.league_id })
                // let status = footballteam_list.length > 0 ? true : false



                // let data2_detail = "";
                // if (data2.length > 0) {
                //     data2_detail = data2[0].name
                // }

                return res.send(response({
                    total_count: total_count,
                    matchDetail: letSendTeamData,
                    // header_name: data2_detail,
                    team_list: data,
                    prize: settings.prize_pool,
                    platform_fee: settings.platform_fees,
                }, footballteam_list.length > 0 ? "Pool list view succesfully.!!!" : "No data found.!!!", true))
            }
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    team_list: async (req, res, next) => {
        try {
            const generalDbConnection = await connectWithGeneralDb();
            const GameAccsSchema = createGameAccsModel(generalDbConnection);
            const SettingSchema = createSettingsModel(generalDbConnection);

            const params = req.body;
            let page = parseInt(req.query.page || 1)
            let limit = parseInt(req.query.limit || 10);
            let startIndex = (page - 1) * limit;

            letSendTeamData = {}
            let gameAccsData = await GameAccsSchema.find({ "gamekey": { "$in": ["pzpool", "tmacc"] } }); // Todo: Not using

            let admin_setting = SettingSchema.findOne({}, { platform_fees: 1, team_acc: 1 })

            if (params.type == "Cricket") {
                const cktDbConnection = await connectWithCricketDb();
                const CktTeamsSchema = createCktTeamsModel(cktDbConnection);
                const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);
                const CktSeriesMetaDataSchema = createCktSeriesMetaDataModel(cktDbConnection);

                const cktname = await CktLeaguesSchema.findOne({ cid: params.league_id })


                let checkhttpurl = isValidHttpUrl(cktname.logo_url)
                if (checkhttpurl) {
                    cktname.logo_url = cktname.logo_url
                } else {
                    cktname.logo_url = `${env.awsimgurl}profile_doc/${cktname.logo_url}`
                }
                let series_logo_url = cktname.logo_url
                let itemLogo = await CktSeriesMetaDataSchema.findOne({ league_id: params.league_id });
                if (itemLogo) {
                    series_logo_url = `${env.awsimgurl}profile_doc/${itemLogo.logo_url}`
                }

                letSendTeamData = {
                    title: cktname.name,
                    logo_url: series_logo_url,
                    date_start: cktname.date_start
                }

                const cricketteam_list = await CktTeamsSchema.find({
                    cid: params.league_id
                }).skip(startIndex).limit(limit).lean();

                let data = cricketteam_list.map((item) => {

                    return ({
                        _id: item._id,
                        league_id: item.cid,
                        team_id: item.team.tid,
                        team_name: item.team.title,
                        team_short_name: item.team.abbr,
                        team_logo_url: item.team.thumb_url,
                        // team_logo_url:item.team.logo_url,
                        team_country_name: item.team.country,
                        price: admin_setting ? admin_setting.team_acc : 0
                    })
                });

                const CktTeamMetaDataSchema = createCktTeamMetaDataModel(cktDbConnection);

                dataList = await Promise.all(data.map(async (item) => {
                    let teamMeta = await CktTeamMetaDataSchema.find({
                        team_id: { "$in": [item.team_id] }
                    })

                    let teamDetailMetaA = teamMeta.filter(x => x.team_id == item.team_id);
                    teamDetailMetaA = teamDetailMetaA && teamDetailMetaA[0];
                    return item.team_logo_url = (teamDetailMetaA && teamDetailMetaA.logo_url) ? `${env.awsimgurl}profile_doc/${teamDetailMetaA.logo_url}` : item.team_logo_url;

                }))



                // count 
                let total_count = await CktTeamsSchema.countDocuments({ cid: params.league_id })
                let settings = await SettingSchema.findOne({})

                if (total_count > 4) {
                    return res.send(response({
                        total_count: total_count,
                        matchDetail: letSendTeamData,
                        team_list: data,
                        prize: settings.team_acc,
                        platform_fee: settings.platform_fees,

                    }, cricketteam_list.length > 0 ? "Team list view succesfully.!!!" : "No data found.!!!", true))
                } else {

                    return res.status(401).send(response({}, `Not sufficient Count.`, false))

                }

            } else if (params.type == "Football") {
                const footballDbConnection = await connectWithFootballDb();
                const FbLeaguesSchema = createFbLeaguesModel(footballDbConnection);
                const FbTeamsSchema = createFbTeamsModel(footballDbConnection);

                const fbname = await FbLeaguesSchema.findOne({ season_id: params.league_id });

                let checkhttpurl = isValidHttpUrl(fbname.logo_path)
                if (checkhttpurl) {
                    fbname.logo_path = fbname.logo_path
                } else {
                    fbname.logo_path = `${env.awsimgurl}profile_doc/${fbname.logo_path}`
                }
                let series_logo_url = fbname.logo_path

                letSendTeamData = {
                    title: fbname.name,
                    logo_url: series_logo_url,
                    date_start: fbname.date_start
                }

                const footballteam_list = await FbTeamsSchema.find({
                    season_id: params.league_id
                }).lean();



                let data = footballteam_list.map((item) => {

                    return ({
                        _id: item._id,
                        league_id: item.season_id,
                        team_id: item.team_id,
                        team_name: item.name,
                        team_short_name: item.short_code,
                        team_logo_url: item.logo_path,
                        price: admin_setting ? admin_setting.team_acc : 0,
                        team_country_name: "",
                    })
                })

                let total_count = await FbTeamsSchema.countDocuments({ season_id: params.league_id })
                let settings = await SettingSchema.findOne({})


                if (total_count > 4) {
                    return res.send(response({
                        total_count: total_count,
                        // header_name: data2_detail,
                        matchDetail: letSendTeamData,
                        team_list: data,
                        prize: settings.team_acc,
                        platform_fee: settings.platform_fees,
                    }, footballteam_list.length > 0 ? "Team list view succesfully.!!!" : "No data found.!!!", true))
                } else {
                    return res.status(401).send(response({}, `Not sufficient Count.`, false))
                    // return res.status(400).send({ message: "Not sufficient Count" })
                }

                // return res.send({total_count: total_count})
            }
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    addplayer_list: async (req, res, next) => {
        // const params1 = req.body;
        // let liveEmitData = {
        //     "match_id": params1.match_id, "type": "m", "fetch_latest": 1, "authorization": req.headers.authorization,"auth":1
            
        // }
        // let sktUrl = (params1.type == "Cricket") ? "my_match_cricket_pool_contest_list_v2" : "my_match_football_pool_contest_list_v2";
        // console.log("sktUrl-addplayer_list-->>",sktUrl,liveEmitData);
        // socketConnection()
        // socket.emit(sktUrl, liveEmitData);
        // return;
        try {
            const cktDbConnection = await connectWithCricketDb();
            const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);
            const CricketPlayersSchema = createCktPlayersModel(cktDbConnection);

            const footballDbConnection = await connectWithFootballDb();
            const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);
            const FbPlayersSchema = createFbPlayersModel(footballDbConnection);

            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UserPlayerMatchCktsSchema = createUserPlayerMatchCktsModel(vendorDbConnection);
            const UserPlayerMatchFbsSchema = createUserPlayerMatchFbsModel(vendorDbConnection);
            const UserTeamCktSchema = createUserTeamCktModel(vendorDbConnection);
            const UserTeamFbSchema = createUserTeamFbModel(vendorDbConnection);

            const params = req.body;
            // const user = req.user
            let SendPlayerData = {}
            let userplymMain = null;
            let userteamMain = null;
            let typeName = "";
            let plyList=null;
            if (params.type == "Cricket") {
                userplymMain = UserPlayerMatchCktsSchema;
                userteamMain = UserTeamCktSchema;
                typeName = "Cricket";

                let matchDetail = await UpcomingCricketsSchema.findOne({ "match_id": params.match_id });

                let currentDates = currentTimeZoneDate() * 1 / 1000;
                let matchDate = matchDetail?.date_start_ist * 1 / 1000;
                if (matchDate < currentDates) {
                    return res.send(response({}, "Match is live now. You cannot join", false))
                }

                plyList = await CricketPlayersSchema.aggregate([
                    {
                        "$match":{"match_id": params.match_id}
                    },
                    {
                        $lookup:
                        {
                            from: "ckt_player_details",
                            localField: "pid",
                            foreignField: "pid",
                            as: "player_detail",
                        },
                    },
                    {
                        $unwind: {
                            "path": "$player_detail",
                            "preserveNullAndEmptyArrays": true
                        }
                    },
                ]);

            } else if (params.type == "Football") {

                userplymMain = UserPlayerMatchFbsSchema;
                userteamMain = UserTeamFbSchema;
                typeName = "Football";
                let matchDetail = await FbUpcomingsSchema.findOne({ "match_id": params.match_id });

                let currentDates = currentTimeZoneDate() * 1 / 1000;
                let matchDate = matchDetail?.date_start_ist * 1 / 1000;
                if (matchDate < currentDates) {
                    return res.send(response({}, "Match is live now. You cannot join", false))
                }

                //let playerteam = await userteamMain.countDocuments({"match_id": params.match_id,"userid":ObjectId(req.user.id)});
                // if((playerteam+1)>settingDetail.maxteam){
                //     return res.send(response({}, "Limit of team create is "+settingDetail.maxteam, false))
                // }

                plyList = await FbPlayersSchema.aggregate([
                    {
                        "$match":{"match_id": params.match_id}
                    },
                    {
                        $lookup:
                        {
                            from: "fb_player_details",
                            localField: "pid",
                            foreignField: "pid",
                            as: "player_detail",
                        },
                    },
                    {
                        $unwind: {
                            "path": "$player_detail",
                            "preserveNullAndEmptyArrays": true
                        }
                    },
                ]);

            }
            
            let sendPlayerData={};
            plyList.forEach(item=>{
                sendPlayerData[item.pid]=item;
            })
            params.userid =ObjectId(req.user.id)


            // params.pid = pid

            let array = params.pid
            let uniqueArray = Array.from(new Set(array));
            console.log("uniqueArray--->>",uniqueArray);
           

            let lengthPlayers = uniqueArray.length;


            if (lengthPlayers == settingDetail.matchPlyCount) {
                //let oldpalyerdata = await userplymckt.distinct("pid", { match_id: params.match_id,userid:req.user.id })
                let oldpalyerdata = await userplymMain.aggregate([
                    {
                        $match: { match_id: params.match_id, userid: params.userid }
                    },
                    {
                        $group: {
                            _id: { "uteamid": "$uteamid" }, "pid": { $push: "$pid" }
                        }
                    }
                ])

                let chkSimilarPlayersTeamCnt = 0;
                oldpalyerdata.forEach((oldItem) => {
                    let oldPlayerList = oldItem.pid;
                    let newPlyList = params.pid;
                    let isSimilarPlyTeam=areArraysEqual(oldPlayerList, newPlyList);
                    if(isSimilarPlyTeam==true){
                        chkSimilarPlayersTeamCnt++;
                    }
                    
                })
                

                if (chkSimilarPlayersTeamCnt > 0) {
                    return res.send(response({}, " Player team already created!.", false));
                } else {
                    let teamData = await userplymMain.find({ match_id: params.match_id, userid: params.userid }, { team_no: 1 }).sort({ _id: -1 }).limit(1)
                    let teamNo = (teamData.length > 0) ? teamData[0]["team_no"] + 1 : 1;
                    params["team_no"] = teamNo;
                    let playerteam = await userteamMain.create(params);
                    let uteamid = playerteam._id
                    params.uteamid = uteamid;
                    
                    if (params?.pid) {
                        await Promise.all(params?.pid?.map(async (item, indexPly) => {
                            return new Promise(async (resolve, reject) => {

                                let createData = {
                                    pid: item,
                                    match_id: params.match_id,
                                    uteamid: ObjectID(params.uteamid),
                                    userid: params.userid,
                                    playing_role: sendPlayerData[item]?.["player_detail"]?.["playing_role"],
                                    mteam_id: sendPlayerData[item]?.["tid"],
                                    team_no: teamNo
                                }
                                
                                let userplymcktSave = await userplymMain.create(createData);
                                userplymcktSave = (userplymcktSave) ? userplymcktSave : "";
                                resolve(userplymcktSave);

                            })

                        })).catch(error => {
                            console.error("One of the promises was rejected:", error);
                        });
                    }

                   
                    // let liveEmitData = {
                    //     "match_id": params.match_id, "type": "m", "fetch_latest": 1, "authorization": req.headers.authorization,"auth":1
                        
                    // }
                    // let sktUrl = (params.type == "Cricket") ? "my_match_cricket_pool_contest_list_v2" : "my_match_football_pool_contest_list_v2";
                    // console.log("sktUrl-addplayer_list-->>",sktUrl,liveEmitData);
                    // socketConnection()
                    // socket.emit(sktUrl, liveEmitData);

                      let liveEmitData = {
                            "match_id": params.match_id, "type": "m", "fetch_latest": 1, "authorization": req.headers.authorization,"auth":1,
                            "userid":req.user.id
                        }
                        let sktUrl = (params.type == "Cricket") ? "my_match_cricket_pool_contest_list_v2" : "my_match_football_pool_contest_list_v2";
                        console.log("sktUrl-addplayer_list-->>",sktUrl,liveEmitData);
                        socketConnection()
                        socket.emit(sktUrl, liveEmitData);

                    return res.send(response({ uteamid: params.uteamid }, "Add " + typeName + " Player Successfully!.", true));
                }

            } else {
                return res.send(response({}, "List of player should be " + settingDetail.matchPlyCount + ".", false));
            }

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    player_detail: async (req, res, next) => {
        try {
            const params = req.body;
            // const user = req.user

            if (params.type == "ckt") {
                const cktDbConnection = await connectWithCricketDb();
                const CktTeamMetaDataSchema = createCktTeamMetaDataModel(cktDbConnection);
                const CktTeamsSchema = createCktTeamsModel(cktDbConnection);
                const CktPlayerMetaDataSchema = createCktPlayerMetaDataModel(cktDbConnection);
                const CktPlayerStatesSchema = createCktPlayerStatesModel(cktDbConnection);
                const CktPlayersFantasyPointsSchema = createCktPlayersFantasyPointsModel(cktDbConnection);
                const CktPlayersSchema = createCktPlayersModel(cktDbConnection);
                const CricketPlayerDetailsSchema=createCricketPlayerDetailsModel(cktDbConnection);
                const CktMatchScoresSchema = createCktMatchScoresModel(cktDbConnection);
                const CktIccRankingSchema = createCktIccRankingModel(cktDbConnection);

                //cricket
                let cktplydata = {}
                let teamdata = {}
                let crktply = await CktPlayersSchema.findOne(
                    { pid: params.player_id }
                )
                let crktplydetail=await CricketPlayerDetailsSchema.findOne(
                    { pid: params.player_id })

                let crktplyMetadata = await CktPlayerMetaDataSchema.findOne(
                    { pid: params.player_id }
                )
                if (!crktplydetail) {
                    return res.send(response({}, "player is not find", false));
                }
                let crktTeam = await CktTeamsSchema.findOne(
                    { team_id: crktply.tid }
                )
                let teamDetailMetaA = await CktTeamMetaDataSchema.findOne(
                    { team_id: crktTeam.team_id }
                )
                //player_performance_list
                let newplydat = {
                    team_id: crktTeam?.team_id,
                    team_name: crktTeam?.team?.title,
                    team_short_name: crktTeam?.team.abbr,
                    team_logo_url: (teamDetailMetaA && teamDetailMetaA.logo_url) ? `${env.awsimgurl}profile_doc/${teamDetailMetaA.logo_url}` : crktTeam?.team?.thumb_url,
                    player_id: crktplydetail.pid,
                    player_name: crktplydetail.title,
                    country: crktplydetail.country,
                    playing_role: crktplydetail.playing_role,
                    batting_style: crktplydetail.batting_style,
                    rating: crktplydetail.fantasy_player_rating,
                    dob: crktplydetail.birthdate,
                    bowling_style: crktplydetail.bowling_style,
                    player_image: (crktplyMetadata && crktplyMetadata.logo_url) ? `${env.awsimgurl}profile_doc/${crktplyMetadata.logo_url}` : "",
                    jersy_no: (crktplyMetadata && crktplyMetadata.jersy_no) ? crktplyMetadata.jersy_no : 0,
                    avg_point: (crktplyMetadata && crktplyMetadata.avg_point) ? crktplyMetadata.avg_point : 0
                }

                let player_performance_list = await CktPlayersFantasyPointsSchema.aggregate([
                    {
                        "$match": {
                            "pid": params.player_id
                        }
                    },
                    {
                        "$lookup": {
                            from: "upcoming_crickets",
                            localField: "match_id",
                            foreignField: "match_id",
                            as: "upcom"
                        }
                    },
                    {
                        "$unwind": "$upcom"
                    },
                    { "$sort": { "upcom.date_start_ist": -1 } },
                    { $limit: 5 },
                    { $project: { "teama": "$upcom.teama", "teamb": "$upcom.teamb", "winning_team_id": "$upcom.winning_team_id", "date_start_ist": "$upcom.date_start_ist", "name": "$upcom.short_title", "name": "$upcom.short_title", "points": "$tp" } }

                ])
                console.log("player_performance_list", player_performance_list);
                let player_state = [];

                let player_states = await CktPlayerStatesSchema.findOne({ pid: params.player_id }, { batting: 1, bowling: 1, _id: -1 }).lean();

                let player_states_list = []
                if (player_states) {
                    player_state.push({ batting: player_states.batting }, { bowling: player_states.bowling })
                    let batting = player_state[0].batting;
                    let bowling = player_state[1].bowling;
                    for (let i in batting) {

                        let batting_detail = []
                        let bowling_detail = []

                        /* Start Batting */
                        let iccrankings_batsmen = await CktIccRankingSchema.findOne({ type: new RegExp(i, "i"), player_type: 'batsmen', player: new RegExp(newplydat.player_name, "i") }, { rank: 1, rating: 1, type: 1 })
                        if (iccrankings_batsmen) {

                            // batting.icc_rank = iccrankings_batsmen.rank;
                            // batting.icc_rating = iccrankings_batsmen.rating;
                            batting_detail.push({ key: "icc_rank", value: iccrankings_batsmen.rank })
                            batting_detail.push({ key: "icc_rating", value: iccrankings_batsmen.rating })
                        } else {
                            batting_detail.push({ key: "icc_rank", value: 0 })
                            batting_detail.push({ key: "icc_rating", value: 0 })

                        }
                        /* End Batting */

                        for (let j in batting[i]) {
                            batting_detail.push({ key: j, value: batting[i][j] })
                        }

                        /* Start Bowlings */
                        let iccrankings_bowlers = await CktIccRankingSchema.findOne({ type: new RegExp(i, "i"), player_type: 'bowlers', player: new RegExp(newplydat.player_name, "i") }, { rank: 1, rating: 1, type: 1 })
                        if (iccrankings_bowlers) {
                            bowling_detail.push({ key: "icc_rank", value: iccrankings_bowlers.rank })
                            bowling_detail.push({ key: "icc_rating", value: iccrankings_bowlers.rating })


                            //    bowling_detail.push({icc_rank:iccrankings_bowlers.rank,icc_rating:iccrankings_bowlers.rating})
                        } else {
                            bowling_detail.push({ key: "icc_rank", value: 0 })
                            bowling_detail.push({ key: "icc_rating", value: 0 })
                            // bowling_detail.push({icc_rank:0,icc_rating:0})
                        }

                        /* End Bowlings  */


                        for (let j in bowling[i]) {


                            bowling_detail.push({ key: j, value: bowling[i][j] })
                        }

                        player_states_list.push({ tabTitle: i, summaryList: [{ title: "Batting Summary", pointsList: batting_detail }, { title: "Bowling Summary", pointsList: bowling_detail }] })
                    }
                }



                //////////////////////////////////////////////
                let tpArr = {};
                let arrayData = [];

                if (params?.match_id) {
                    let queryScore = await CktMatchScoresSchema.findOne({ "match_id": params.match_id })


                    let itemMatch = queryScore;


                    let matchInnings = itemMatch && itemMatch.innings ? itemMatch.innings : [];
                    let matchId = itemMatch.match_id;
                    let leagueId = itemMatch.competition.cid;
                    let seasonId = itemMatch["competition"]["season"];



                    let smatchType = "";
                    if (itemMatch.competition.match_format == "mixed") {
                        smatchType = matchType[itemMatch.format_str];
                    } else {
                        smatchType = matchType[itemMatch.competition.match_format];
                    }

                    if (smatchType) {
                        matchInnings.forEach((itemInning) => {
                            let plyScrBat = itemInning.batsmen;
                            let plyScrBow = itemInning.bowlers;
                            let plyScrFild = itemInning.fielder;


                            /*Batting Start*/
                            plyScrBat.forEach((itemPlayer) => {
                                let team_id = itemInning.batting_team_id
                                if (itemPlayer.runs && itemPlayer.runs >= 0) {
                                    let pId = itemPlayer.batsman_id;
                                    let itemResult = itemPlayer;

                                    if (pId === params.player_id.toString()) {

                                        tpArr["run"] = itemResult["runs"];


                                        tpArr["four"] = itemResult["fours"];

                                        tpArr["six"] = itemResult["sixes"];


                                        let myrun = parseFloat(itemResult["runs"]);

                                        if ((smatchType == 't20' || smatchType == 't10') && (myrun >= 30 && myrun < 50)) {

                                            tpArr["thirty"] = myrun;

                                        }


                                        if (myrun >= 50 && myrun < 100) {

                                            tpArr["fifty"] = myrun;
                                        }
                                        if ((smatchType == 't20' || smatchType == 't10') && myrun >= 100) {
                                            tpArr["hundred"] = myrun;
                                        }

                                        if (smatchType == 'odi' && (myrun >= 100 && myrun < 150)) {
                                            tpArr["hundred"] = myrun;
                                        }

                                        if (smatchType == 'test' && (myrun >= 100 && myrun < 200)) {
                                            tpArr["hundred"] = myrun;
                                        }

                                        if (smatchType == 'odi' && myrun >= 150) {
                                            tpArr["onefifty"] = myrun;
                                        }

                                        if (smatchType == 'test' && myrun >= 200) {
                                            tpArr["twohundred"] = myrun;
                                        }

                                        if (smatchType == 'odi') {
                                            r1 = 70;
                                            r2 = 85;
                                            r3a = 90;
                                            r3 = 100;
                                            r4 = 115;
                                            r5 = 130;

                                        }
                                        if (smatchType == 't20') {
                                            r1 = 80;
                                            r2 = 100;
                                            r3a = 115;
                                            r3 = 130;
                                            r4 = 170;
                                            r5 = 190;
                                        }
                                        if (smatchType == 't10') {
                                            r1 = 90;
                                            r2 = 110;
                                            r3a = 130;
                                            r3 = 140;
                                            r4 = 180;
                                            r5 = 200;
                                        }

                                        if (smatchType == 'odi' || smatchType == 't20' || smatchType == 't10') {
                                            //let ptype = 2;  // Player Type Batsman
                                            //let plrType = matchPlayers.find(plr => (plr.pid === playerid));



                                            if (parseFloat(itemResult["strike_rate"]) < r1) {
                                                tpArr["srone"] = itemResult["strike_rate"];
                                            }


                                            if (parseFloat(itemResult["strike_rate"]) >= r1 && parseFloat(itemResult["strike_rate"]) < r2) {
                                                tpArr["srtwo"] = itemResult["strike_rate"];
                                            }

                                            else if (parseFloat(itemResult["strike_rate"]) >= r3a && parseFloat(itemResult["strike_rate"]) < r3) {
                                                tpArr["srthree"] = itemResult["strike_rate"];
                                            }
                                            else if (parseFloat(itemResult["strike_rate"]) >= r3 && parseFloat(itemResult["strike_rate"]) < r4) {
                                                tpArr["srfour"] = itemResult["strike_rate"];
                                            }
                                            else if (parseFloat(itemResult["strike_rate"]) >= r4 && parseFloat(itemResult["strike_rate"]) < r5) {
                                                tpArr["srfive"] = itemResult["strike_rate"];
                                            }
                                            else if (parseFloat(itemResult["strike_rate"]) >= r5) {
                                                tpArr["srsix"] = itemResult["strike_rate"];
                                            }
                                            //}
                                        }


                                        if (itemResult["dismissal"]) {
                                            if (myrun == 0) {
                                                tpArr["duck"] = itemResult["dismissal"];
                                            }

                                            let bowId = itemResult["bowler_id"];
                                            if (bowId && itemResult["dismissal"] == "lbw") {
                                                tpArr["lbwbns"] = itemResult["dismissal"];
                                            }

                                            if (itemResult["dismissal"] == "runout" && itemResult["second_fielder_id"] == "") {

                                                let fId = itemResult["first_fielder_id"];

                                                tpArr[fId]["directhit"] = itemResult["dismissal"];
                                            }

                                        }

                                    }

                                }
                            })
                            /*Batting End*/

                            plyScrBow.forEach((itemBow) => {
                                let team_id = itemInning.fielding_team_id
                                let pId = itemBow.bowler_id;
                                if (itemBow["runs_conceded"] && parseFloat(itemBow["runs_conceded"]) > 0) {
                                    let itemResult = itemBow;
                                    if (pId === params.player_id.toString()) {

                                        tpArr["wicket"] = itemResult["wickets"];

                                        tpArr["mdnover"] = itemResult["maidens"];

                                        if (smatchType != "test" && parseFloat(itemResult["wickets"]) == 3) {
                                            tpArr["threewhb"] = itemResult["wickets"];
                                        }
                                        if (parseFloat(itemResult["wickets"]) == 4) {
                                            tpArr["fourwhb"] = itemResult["wickets"];
                                        }
                                        if (smatchType != "test" && parseFloat(itemResult["wickets"]) >= 5) {
                                            tpArr["fivewhb"] = itemResult["wickets"];
                                        }
                                        if (smatchType == "test" && parseFloat(itemResult["wickets"]) == 5) {
                                            tpArr["fivewhb"] = itemResult["wickets"];
                                        }
                                        if (smatchType == "test" && parseFloat(itemResult["wickets"]) >= 10) {
                                            tpArr["tenwhb"] = itemResult["wickets"];
                                        }

                                        if (smatchType == 'odi') {
                                            rer1 = 4;
                                            rer2 = 5;
                                            rer3 = 5.5;
                                            rer4 = 6;
                                            rer5 = 6.5;
                                            rer6 = 7.5;
                                        }
                                        if (smatchType == 't20') {
                                            rer1 = 5;
                                            rer2 = 6.5;
                                            rer3 = 7.5;
                                            rer4 = 8;
                                            rer5 = 9;
                                            rer6 = 12;
                                        }
                                        if (smatchType == 't10') {
                                            rer1 = 6;
                                            rer2 = 7.5;
                                            rer3 = 8.5;
                                            rer4 = 9.5;
                                            rer5 = 10;
                                            rer6 = 13;
                                        }
                                        if ((smatchType == 'odi' || smatchType == 't20' || smatchType == 't10')) {

                                            if (parseFloat(itemResult["econ"]) < rer1) {
                                                tpArr["erone"] = itemResult["econ"];
                                            }
                                            else if (parseFloat(itemResult["econ"]) >= rer1 && parseFloat(itemResult["econ"]) < rer2) {
                                                tpArr["ertwo"] = itemResult["econ"];
                                            }
                                            else if (parseFloat(itemResult["econ"]) >= rer2 && parseFloat(itemResult["econ"]) < rer3) {
                                                tpArr["erthree"] = itemResult["econ"];
                                            }
                                            else if (parseFloat(itemResult["econ"]) >= rer3 && parseFloat(itemResult["econ"]) < rer4) {
                                                tpArr["erfour"] = itemResult["econ"];
                                            }

                                            else if (parseFloat(itemResult["econ"]) >= rer5 && parseFloat(itemResult["econ"]) < rer6) {
                                                tpArr["erfive"] = itemResult["econ"];
                                            }
                                            else if (parseFloat(itemResult["econ"]) >= rer6) {
                                                tpArr["ersix"] = itemResult["econ"];
                                            }
                                        }

                                    }

                                }
                            })


                            plyScrFild.forEach((itemField) => {
                                let team_id = itemInning.fielding_team_id
                                let pId = itemField.fielder_id;
                                let itemResult = itemField;
                                if (pId === params.player_id.toString()) {
                                    tpArr["catch"] = itemResult["catches"];
                                    if (itemResult["catches"] >= 3 && itemResult["catches"] < 5) {
                                        tpArr["catchthree"] = itemResult["catches"];
                                    }
                                    if (smatchType == "test" && itemResult["catches"] >= 5) {
                                        tpArr["catchfive"] = itemResult["catches"];
                                    }

                                    tpArr["stumped"] = itemResult["stumping"];

                                    tpArr["thrower"] = itemResult["runout_thrower"];
                                    tpArr["catcher"] = itemResult["runout_catcher"];
                                }
                            })
                        })

                    } else {
                        //console.log("Not In------>>", itemMatch.competition.match_format)

                    }

                    let plyFntyData = await CktPlayersFantasyPointsSchema.findOne({ "match_id": params.match_id, "pid": params.player_id })

                    let arrayDataBat = [], arrayDataBow = [], arrayDataFild = [], arrayDataCom = [];
                    if (plyFntyData) {
                        plyFntyData["wicket"] && arrayDataBow.push({ "name": "Wicket", "point": plyFntyData["wicket"], "actual": tpArr["wicket"] });
                        plyFntyData["catch"] && arrayDataFild.push({ "name": "Catch", "point": plyFntyData["catch"], "actual": tpArr["catch"] });
                        plyFntyData["catchthree"] && arrayDataFild.push({ "name": "Three Catches", "point": plyFntyData["catchthree"], "actual": tpArr["catchthree"] });
                        plyFntyData["catchfive"] && arrayDataFild.push({ "name": "Five Catches", "point": plyFntyData["catchfive"], "actual": tpArr["catchfive"] });
                        plyFntyData["run"] && arrayDataBat.push({ "name": "Runs", "point": plyFntyData["run"], "actual": tpArr["run"] });
                        plyFntyData["six"] && arrayDataBat.push({ "name": "Six", "point": plyFntyData["six"], "actual": tpArr["six"] });
                        plyFntyData["four"] && arrayDataBat.push({ "name": "Four", "point": plyFntyData["four"], "actual": tpArr["four"] });
                        plyFntyData["thirty"] && arrayDataBat.push({ "name": "Thirty Runs", "point": plyFntyData["thirty"], "actual": tpArr["thirty"] });
                        plyFntyData["fifty"] && arrayDataBat.push({ "name": "Fifty Runs", "point": plyFntyData["fifty"], "actual": tpArr["fifty"] });
                        plyFntyData["hundred"] && arrayDataBat.push({ "name": "Hundred Runs", "point": plyFntyData["hundred"], "actual": tpArr["hundred"] });
                        plyFntyData["duck"] && arrayDataBat.push({ "name": "Duck", "point": plyFntyData["duck"], "actual": tpArr["duck"] });
                        plyFntyData["mdnover"] && arrayDataBow.push({ "name": "Maiden Over", "point": plyFntyData["mdnover"], "actual": tpArr["mdnover"] });
                        plyFntyData["stumped"] && arrayDataFild.push({ "name": "Stumped", "point": plyFntyData["stumped"], "actual": tpArr["stumped"] });
                        plyFntyData["fourwhb"] && arrayDataBow.push({ "name": "Four Wicket Haul", "point": plyFntyData["fourwhb"], "actual": tpArr["fourwhb"] });
                        plyFntyData["threewhb"] && arrayDataBow.push({ "name": "Three Wicket Haul", "point": plyFntyData["threewhb"], "actual": tpArr["threewhb"] });
                        plyFntyData["fivewhb"] && arrayDataBow.push({ "name": "Five Wicket Haul", "point": plyFntyData["fivewhb"], "actual": tpArr["fivewhb"] });
                        plyFntyData["runout"] && arrayDataBat.push({ "name": "Runout", "point": plyFntyData["runout"], "actual": tpArr["runout"] });
                        plyFntyData["thrower"] && arrayDataFild.push({ "name": "Thrower", "point": plyFntyData["thrower"], "actual": tpArr["thrower"] });
                        plyFntyData["catcher"] && arrayDataFild.push({ "name": "Catcher", "point": plyFntyData["catcher"], "actual": tpArr["catcher"] });
                        plyFntyData["srone"] && arrayDataBat.push({ "name": "Strike Rate", "point": plyFntyData["srone"], "actual": tpArr["srone"] });
                        plyFntyData["srtwo"] && arrayDataBat.push({ "name": "Strike Rate", "point": plyFntyData["srtwo"], "actual": tpArr["srtwo"] });
                        plyFntyData["srthree"] && arrayDataBat.push({ "name": "Strike Rate", "point": plyFntyData["srthree"], "actual": tpArr["srthree"] });
                        plyFntyData["srfour"] && arrayDataBat.push({ "name": "Strike Rate", "point": plyFntyData["srfour"], "actual": tpArr["srfour"] });
                        plyFntyData["srfive"] && arrayDataBat.push({ "name": "Strike Rate", "point": plyFntyData["srfive"], "actual": tpArr["srfive"] });
                        plyFntyData["srsix"] && arrayDataBat.push({ "name": "Strike Rate", "point": plyFntyData["srsix"], "actual": tpArr["srsix"] });
                        plyFntyData["erone"] && arrayDataBow.push({ "name": "Economy Rate", "point": plyFntyData["erone"], "actual": tpArr["erone"] });
                        plyFntyData["ertwo"] && arrayDataBow.push({ "name": "Economy Rate", "point": plyFntyData["ertwo"], "actual": tpArr["ertwo"] });
                        plyFntyData["erthree"] && arrayDataBow.push({ "name": "Economy Rate", "point": plyFntyData["erthree"], "actual": tpArr["erthree"] });
                        plyFntyData["erfour"] && arrayDataBow.push({ "name": "Economy Rate", "point": plyFntyData["erfour"], "actual": tpArr["erfour"] });
                        plyFntyData["erfive"] && arrayDataBow.push({ "name": "Economy Rate", "point": plyFntyData["erfive"], "actual": tpArr["erfive"] });
                        plyFntyData["ersix"] && arrayDataBow.push({ "name": "Economy Rate", "point": plyFntyData["ersix"], "actual": tpArr["ersix"] });
                        plyFntyData["erseven"] && arrayDataBow.push({ "name": "Economy Rate", "point": plyFntyData["erseven"], "actual": tpArr["erseven"] });
                        //plyFntyData["srmball"] && arrayDataBat.push({"name":"srmball","point":plyFntyData["srmball"],"actual":tpArr["srmball"]});
                        //plyFntyData["ermover"] && arrayDataBow.push({"name":"Economy Rate Over","point":plyFntyData["ermover"],"actual":tpArr["ermover"]});
                        plyFntyData["onefifty"] && arrayDataBat.push({ "name": "One Fifty Runs", "point": plyFntyData["onefifty"], "actual": tpArr["onefifty"] });
                        plyFntyData["twohundred"] && arrayDataBat.push({ "name": "Two Hundred Runs", "point": plyFntyData["twohundred"], "actual": tpArr["twohundred"] });
                        plyFntyData["lbwbns"] && arrayDataBow.push({ "name": "LBW Bonus", "point": plyFntyData["lbwbns"], "actual": tpArr["lbwbns"] });
                        plyFntyData["directhit"] && arrayDataFild.push({ "name": "Direct Hit", "point": plyFntyData["directhit"], "actual": tpArr["directhit"] });
                        plyFntyData["playing11"] && arrayDataCom.push({ "name": "Playing11", "point": plyFntyData["playing11"], "actual": tpArr["playing11"] });
                        plyFntyData["runs_conceded"] && arrayDataBow.push({ "name": "Runs Conceded", "point": plyFntyData["runs_conceded"], "actual": tpArr["runs_conceded"] });
                        plyFntyData["tenwhb"] && arrayDataBow.push({ "name": "Ten Wicket Haul", "point": plyFntyData["tenwhb"], "actual": tpArr["tenwhb"] });
                        newplydat["totalpt"] = plyFntyData["tp"];
                    }

                    arrayData.push({ "name": "General", "key": "def", "data": arrayDataCom });
                    arrayDataBat.length > 0 && arrayData.push({ "name": "Batting", "key": "bat", "data": arrayDataBat });
                    arrayDataBow.length > 0 && arrayData.push({ "name": "Bowling", "key": "bat", "data": arrayDataBow });
                    arrayDataFild.length > 0 && arrayData.push({ "name": "Fielding", "key": "bat", "data": arrayDataFild });
                    /////////////////////////////////////////////////


                } else
                    if (params?.league_id) {
                        let plyFant = await CktPlayersFantasyPointsSchema.find({ "league_id": parseInt(params.league_id), "pid": parseInt(params.player_id) });
                        let tpF = 0;
                        plyFant.map(item => {
                            tpF = tpF + item.tp;
                        })
                        let tl = plyFant.length > 0 ? plyFant.length : 1;
                        let arrayFt = [];
                        arrayFt.push({ "name": "Average Points", "point": (tpF / tl).toFixed(2), "actual": "-" })
                        arrayData.push({ "name": "Average Points", "key": "bat", "data": arrayFt });
                    }
                let playe_detail = {
                    "player_detail": newplydat, "player_performance_list": player_performance_list, "player_states_list": player_states_list,
                    "fantasy_points": arrayData
                }
                return res.send(response(playe_detail, "player detail find successfully", true));

            } else if (params.type == "fb") {
                const footballDbConnection = await connectWithFootballDb();
                const FbScoresSchema = createFbScoresModel(footballDbConnection);
                const FbPlayerDetailsSchema = createFbPlayerDetailsModel(footballDbConnection);
                const FbPlayerFantasyPointsSchema = createFbPlayerFantasyPointsModel(footballDbConnection)
                const FbPlayerStatisticsDetailSchema = createFbPlayerStatisticsDetailModel(footballDbConnection);
                const FbTeamsSchema = createFbTeamsModel(footballDbConnection);

                let plyData = {};
                let fbteamdata = {};

                params.player_id = parseInt(params.player_id);
                //let fbplayersdetail = await fbplayers.findOne({ "teama.squad.data": { "$elemMatch": { "player_id": params.player_id } } }, { "teama.squad.data.$": 1, "teama.team": 1 })
                let fbplayersdetail = await FbPlayerDetailsSchema.findOne({ pid: params.player_id })

                if (!fbplayersdetail) {
                    return res.send(response({}, "player is not find", false));
                }


                let fbTeam = await FbTeamsSchema.findOne(
                    { team_id: fbplayersdetail.tid }
                )


                let newplydat = {
                    "team_id": fbTeam ? fbTeam.team_id : null,
                    "team_name": fbTeam ? fbTeam.name : null,
                    "team_short_name": fbTeam ? fbTeam.short_code : null,
                    "team_logo_url": fbTeam ? fbTeam.logo_path : null,
                    //"player_id": fbplayersdetail.player_id,
                    "player_name": fbplayersdetail.fullname,
                    "position_id": fbplayersdetail.position_id,
                    "rating": fbplayersdetail.rating,
                    "nationality": fbplayersdetail.nationality,
                    "birthdate": fbplayersdetail.birthdate,
                    "player_image": fbplayersdetail.image_path,
                    "is_playing": fbplayersdetail.is_playing,
                    "height": fbplayersdetail.height,
                    "avg_point": "",
                }
                let fb_player_fantacy_avg_points = await FbPlayerFantasyPointsSchema.find({ "pid": params.player_id }, { tp: 1 }).sort({ _id: -1 }).limit(10).lean();
                if (fb_player_fantacy_avg_points && fb_player_fantacy_avg_points.length > 0) {
                    let avg_tp = fb_player_fantacy_avg_points.reduce((a, b) => ({ tp: a.tp + b.tp }));
                    newplydat.avg_point = (avg_tp.tp / 5).toFixed(2);
                } else {
                    newplydat.avg_point = 0;
                }

                let player_performance_list = await FbPlayerFantasyPointsSchema.aggregate([
                    {
                        "$match": {
                            "pid": params.player_id
                        }
                    },
                    {
                        "$lookup": {
                            from: "fb_upcomings",//Todo: This is updated schema name
                            localField: "match_id",
                            foreignField: "match_id",
                            as: "upcom"
                        }
                    },
                    {
                        "$unwind": "$upcom"
                    },
                    { "$sort": { "upcom.date_start_ist": -1 } },
                    { $limit: 5 },
                    { $project: { "date_start_ist": "$upcom.date_start_ist", "name": { $concat: ["$upcom.teama.name", " v/s ", "$upcom.teamb.name"] }, "points": "$tp", "season_id": "$season_id", "match_id": "$match_id" } }

                ])

                let player_statistics = await FbPlayerStatisticsDetailSchema.findOne({ pid: params.player_id }).lean();
                if (params?.seasonId) {
                    player_statistics = await FbPlayerStatisticsDetailSchema.findOne({ pid: params.player_id, season_id: params.seasonId }).lean();
                }

                let arrayData = [];
                let arrayDataDef = [], arrayDataMid = [], arrayDataFwd = [], arrayDataGk = [], arrayDataCom = [];
                let totalpt = 0;
                if (params?.match_id) {
                    params.match_id = parseInt(params.match_id);

                    let plyFntyData = await FbPlayerFantasyPointsSchema.findOne({ match_id: params.match_id, pid: params.player_id })


                    let queryScore = await FbScoresSchema.findOne({ "match_id": params.match_id }).lean();


                    let item = queryScore;

                    let benchData = (item && item.bench && item.bench.data) ? item.bench.data : [];
                    let lineupData = (item && item.lineup && item.lineup.data) ? item.lineup.data : [];

                    //////////////////////
                    let mergPlayers = benchData.concat(lineupData);

                    let ppp = mergPlayers.filter(x => x.player_id === params.player_id)

                    let plrStats = (ppp && ppp.length > 0) ? ppp[0].stats : {};


                    // mergPlayers.forEach((itemPly) => {
                    //     let bench_lineup_type = itemPly.type;
                    //     let pId = itemPly.player_id;
                    //     let team_id = itemPly.team_id;
                    //     let plrType = itemPly.position;
                    //     let plrStats = itemPly.stats;
                    // })

                    //arrayData["def"][""]={"goals":{"point":0,"actual":0}};
                    //////////////////////////////////////////

                    let tpArr = {};
                    tpArr["goalgk"] = plrStats["goals"].scored;
                    tpArr["goaldef"] = plrStats["goals"].scored;
                    tpArr["goalmid"] = plrStats["goals"].scored;
                    tpArr["goalfor"] = plrStats["goals"].scored;
                    tpArr["penaltysavegk"] = plrStats["other"].pen_saved;
                    tpArr["assistgk"] = plrStats["goals"].assists;
                    tpArr["foul_concededgk"] = plrStats["fouls"].committed;
                    tpArr["penaltyscoredgk"] = plrStats["other"].pen_scored;
                    tpArr["penaltymissedgk"] = plrStats["other"].pen_missed;
                    tpArr["owngoalgk"] = plrStats["goals"].owngoals;
                    tpArr["redcardgk"] = plrStats["cards"].redcards;
                    tpArr["yellowcardgk"] = plrStats["cards"].yellowredcards;
                    tpArr["cleansheetgk"] = plrStats["cleansheets"];
                    tpArr["assistdef"] = plrStats["goals"].assists;
                    tpArr["foul_concededdef"] = plrStats["fouls"].committed;
                    tpArr["penaltyscoreddef"] = plrStats["other"].pen_scored;
                    tpArr["penaltymisseddef"] = plrStats["other"].pen_missed;
                    tpArr["dribbles_completeddef"] = plrStats["dribbles"].success;
                    tpArr["duelswondef"] = plrStats["duels"].won;
                    tpArr["owngoaldef"] = plrStats["goals"].owngoals;
                    tpArr["redcarddef"] = plrStats["cards"].redcards;
                    tpArr["yellowcarddef"] = plrStats["cards"].yellowredcards;
                    tpArr["cleansheetdef"] = plrStats["cleansheets"];
                    tpArr["interceptionsdef"] = plrStats["other"].interceptions;
                    tpArr["foulsdrawndef"] = plrStats["fouls"].drawn;
                    tpArr["twogoaldef"] = plrStats["goals"].scored;
                    tpArr["threegoaldef"] = plrStats["goals"].scored;
                    tpArr["assistmid"] = plrStats["goals"].assists;
                    tpArr["foul_concededmid"] = plrStats["fouls"].committed;
                    tpArr["penaltyscoredmid"] = plrStats["other"].pen_scored;
                    tpArr["penaltymissedmid"] = plrStats["other"].pen_missed;
                    tpArr["dribbles_completedmid"] = plrStats["dribbles"].success;
                    tpArr["duelswonmid"] = plrStats["duels"].won;
                    tpArr["owngoalmid"] = plrStats["goals"].owngoals;
                    tpArr["redcardmid"] = plrStats["cards"].redcards;
                    tpArr["yellowcardmid"] = plrStats["cards"].yellowredcards;
                    tpArr["cleansheetmid"] = plrStats["cleansheets"];
                    tpArr["interceptionsmid"] = plrStats["other"].interceptions;
                    tpArr["foulsdrawnmid"] = plrStats["fouls"].drawn;
                    tpArr["twogoalmid"] = plrStats["goals"].scored;
                    tpArr["threegoalmid"] = plrStats["goals"].scored;
                    tpArr["assistfow"] = plrStats["goals"].assists;
                    tpArr["foul_concededfor"] = plrStats["fouls"].committed;
                    tpArr["penaltyscoredfor"] = plrStats["other"].pen_scored;
                    tpArr["penaltymissedfwd"] = plrStats["other"].pen_missed;
                    tpArr["dribbles_completedfwd"] = plrStats["dribbles"].success;
                    tpArr["duelswonfwd"] = plrStats["duels"].won;
                    tpArr["owngoalfwd"] = plrStats["goals"].owngoals;
                    tpArr["redcardfwd"] = plrStats["cards"].redcards;
                    tpArr["yellowcardfwd"] = plrStats["cards"].yellowredcards;
                    tpArr["cleansheetfwd"] = plrStats["cleansheets"];
                    tpArr["interceptionsfwd"] = plrStats["other"].interceptions;
                    tpArr["foulsdrawnfwd"] = plrStats["fouls"].drawn;
                    tpArr["twogoalfwd"] = plrStats["goals"].scored;
                    tpArr["threegoalfwd"] = plrStats["goals"].scored;

                    tpArr["shot_on_targetfwd"] = plrStats["shots"]["shots_on_goal"];
                    tpArr["shot_on_targetmid"] = plrStats["shots"]["shots_on_goal"];
                    tpArr["shot_on_targetdef"] = plrStats["shots"]["shots_on_goal"];

                    tpArr["tacklefwd"] = plrStats["other"]["tackles"];
                    tpArr["tacklemid"] = plrStats["other"]["tackles"];
                    tpArr["tackledef"] = plrStats["other"]["tackles"];

                    tpArr["fourpassesgk"] = plrStats["passing"]["passes"];
                    tpArr["fourpassesfwd"] = plrStats["passing"]["passes"];
                    tpArr["fourpassesmid"] = plrStats["passing"]["passes"];
                    tpArr["fourpassesdef"] = plrStats["passing"]["passes"];

                    tpArr["goalsconcededdef"] = plrStats["goals"].conceded;
                    tpArr["goalsconcededmid"] = plrStats["goals"].conceded;
                    tpArr["goalsconcededfow"] = plrStats["goals"].conceded;

                    tpArr["threemispassgk"] = "accurate_passes - " + plrStats["passing"]["accurate_passes"] + ", passes - " + plrStats["passing"]["passes"];
                    tpArr["threemispassfwd"] = "accurate_passes - " + plrStats["passing"]["accurate_passes"] + ", passes - " + plrStats["passing"]["passes"];
                    tpArr["threemispassmid"] = "accurate_passes - " + plrStats["passing"]["accurate_passes"] + ", passes - " + plrStats["passing"]["passes"];
                    tpArr["threemispassdef"] = "accurate_passes - " + plrStats["passing"]["accurate_passes"] + ", passes - " + plrStats["passing"]["passes"];

                    tpArr["playsixtyminfwd"] = plrStats["other"].minutes_played;
                    tpArr["playsixtyminmid"] = plrStats["other"].minutes_played;
                    tpArr["playsixtymindef"] = plrStats["other"].minutes_played;
                    tpArr["penaltymissed"] = plrStats["other"].minutes_played;

                    tpArr["shot_off_targetfwd"] = "shots_on_goal- " + plrStats["shots"]["shots_on_goal"] + ", shots_total- " + plrStats["shots"]["shots_total"]
                    tpArr["shot_off_targetmid"] = "shots_on_goal- " + plrStats["shots"]["shots_on_goal"] + ", shots_total- " + plrStats["shots"]["shots_total"]
                    tpArr["shot_off_targetdef"] = "shots_on_goal- " + plrStats["shots"]["shots_on_goal"] + ", shots_total- " + plrStats["shots"]["shots_total"]
                    tpArr["goalsaved"] = plrStats["other"].saves;

                    tpArr["punches"] = plrStats["other"].punches;

                    ////////NEW//////////

                    
                    tpArr["shots_off_target_gk"]=plrStats["shots_off_target"];
                    tpArr["shots_off_target_def"]=plrStats["shots_off_target"];
                    tpArr["shots_off_target_mid"]=plrStats["shots_off_target"];
                    tpArr["shots_off_target_fwd"]=plrStats["shots_off_target"];

                    
                    tpArr["shots_blocked_gk"]=plrStats["shots_blocked"];
                    tpArr["shots_blocked_def"]=plrStats["shots_blocked"];
                    tpArr["shots_blocked_mid"]=plrStats["shots_blocked"];
                    tpArr["shots_blocked_fwd"]=plrStats["shots_blocked"];

                    
                    tpArr["long_passes_gk"]=plrStats["long_passes"];
                    tpArr["long_passes_def"]=plrStats["long_passes"];
                    tpArr["long_passes_mid"]=plrStats["long_passes"];
                    tpArr["long_passes_fwd"]=plrStats["long_passes"];

                    
                    tpArr["short_passes_gk"]=plrStats["short_passes"];
                    tpArr["short_passes_def"]=plrStats["short_passes"];
                    tpArr["short_passes_mid"]=plrStats["short_passes"];
                    tpArr["short_passes_fwd"]=plrStats["short_passes"];

                    
                    tpArr["challenges_gk"]=plrStats["challenges"];
                    tpArr["challenges_def"]=plrStats["challenges"];
                    tpArr["challenges_mid"]=plrStats["challenges"];
                    tpArr["challenges_fwd"]=plrStats["challenges"];

                    
                    tpArr["yellowcards_gk"]=plrStats["yellowcards"];
                    tpArr["yellowcards_def"]=plrStats["yellowcards"];
                    tpArr["yellowcards_mid"]=plrStats["yellowcards"];
                    tpArr["yellowcards_fwd"]=plrStats["yellowcards"];

                    
                    console.log("clearances--->>",plrStats["clearances"]);
                    
                    tpArr["clearances_gk"]=plrStats["clearances"];
                    tpArr["clearances_def"]=plrStats["clearances"];
                    tpArr["clearances_mid"]=plrStats["clearances"];
                    tpArr["clearances_fwd"]=plrStats["clearances"];

                    
                    tpArr["saves_inside_box_gk"]=plrStats["saves_inside_box"];

                    
                    tpArr["dribbled_past_gk"]=plrStats["dribbled_past"];
                    tpArr["dribbled_past_def"]=plrStats["dribbled_past"];
                    tpArr["dribbled_past_mid"]=plrStats["dribbled_past"];
                    tpArr["dribbled_past_fwd"]=plrStats["dribbled_past"];

                    
                    tpArr["penalties_saved_gk"]=plrStats["penalties_saved"];

                    
                    tpArr["rating_gk"]=plrStats["rating"];
                    tpArr["rating_def"]=plrStats["rating"];
                    tpArr["rating_mid"]=plrStats["rating"];
                    tpArr["rating_fwd"]=plrStats["rating"];

                    
                    tpArr["long_balls_won_gk"]=plrStats["long_balls_won"];
                    tpArr["long_balls_won_def"]=plrStats["long_balls_won"];
                    tpArr["long_balls_won_mid"]=plrStats["long_balls_won"];
                    tpArr["long_balls_won_fwd"]=plrStats["long_balls_won"];

                    
                    tpArr["long_balls_gk"]=plrStats["long_balls"];
                    tpArr["long_balls_def"]=plrStats["long_balls"];
                    tpArr["long_balls_mid"]=plrStats["long_balls"];
                    tpArr["long_balls_fwd"]=plrStats["long_balls"];

                    
                    tpArr["matches_gk"]=plrStats["matches"];
                    tpArr["matches_def"]=plrStats["matches"];
                    tpArr["matches_mid"]=plrStats["matches"];
                    tpArr["matches_fwd"]=plrStats["matches"];

                    
                    tpArr["appearances_gk"]=plrStats["appearances"];
                    tpArr["appearances_def"]=plrStats["appearances"];
                    tpArr["appearances_mid"]=plrStats["appearances"];
                    tpArr["appearances_fwd"]=plrStats["appearances"];

                    
                    tpArr["bench_gk"]=plrStats["bench"];
                    tpArr["bench_def"]=plrStats["bench"];
                    tpArr["bench_mid"]=plrStats["bench"];
                    tpArr["bench_fwd"]=plrStats["bench"];

                    
                    tpArr["error_lead_to_goal_gk"]=plrStats["error_lead_to_goal"];
                    tpArr["error_lead_to_goal_def"]=plrStats["error_lead_to_goal"];
                    tpArr["error_lead_to_goal_mid"]=plrStats["error_lead_to_goal"];
                    tpArr["error_lead_to_goal_fwd"]=plrStats["error_lead_to_goal"];

                    
                    tpArr["offsides_provoked_def"]=plrStats["offsides_provoked"];
                    tpArr["offsides_provoked_mid"]=plrStats["offsides_provoked"];

                    
                    tpArr["offsides_def"]=plrStats["offsides"];
                    tpArr["offsides_mid"]=plrStats["offsides"];
                    tpArr["offsides_fwd"]=plrStats["offsides"];

                    
                    tpArr["hit_woodwork_def"]=plrStats["hit_woodwork"];
                    tpArr["hit_woodwork_mid"]=plrStats["hit_woodwork"];
                    tpArr["hit_woodwork_fwd"]=plrStats["hit_woodwork"];

                    
                    tpArr["successful_headers_def"]=plrStats["successful_headers"];
                    tpArr["successful_headers_mid"]=plrStats["successful_headers"];
                    tpArr["successful_headers_fwd"]=plrStats["successful_headers"];

                    
                    tpArr["headers_def"]=plrStats["headers"];
                    tpArr["headers_mid"]=plrStats["headers"];
                    tpArr["headers_fwd"]=plrStats["headers"];

                    
                    tpArr["dispossessed_def"]=plrStats["dispossessed"];
                    tpArr["dispossessed_mid"]=plrStats["dispossessed"];
                    tpArr["dispossessed_fwd"]=plrStats["dispossessed"];

                    
                    tpArr["total_crosses_def"]=plrStats["total_crosses"];
                    tpArr["total_crosses_mid"]=plrStats["total_crosses"];
                    tpArr["total_crosses_fwd"]=plrStats["total_crosses"];

                    
                    tpArr["accurate_crosses_def"]=plrStats["accurate_crosses"];
                    tpArr["accurate_crosses_mid"]=plrStats["accurate_crosses"];
                    tpArr["accurate_crosses_fwd"]=plrStats["accurate_crosses"];

                    
                    tpArr["total_duels_def"]=plrStats["total_duels"];
                    tpArr["total_duels_mid"]=plrStats["total_duels"];
                    tpArr["total_duels_fwd"]=plrStats["total_duels"];

                    
                    tpArr["aerials_won_def"]=plrStats["aerials_won"];
                    tpArr["aerials_won_mid"]=plrStats["aerials_won"];
                    tpArr["aerials_won_fwd"]=plrStats["aerials_won"];

                    
                    tpArr["penalties_won_def"]=plrStats["penalties_won"];
                    tpArr["penalties_won_mid"]=plrStats["penalties_won"];
                    tpArr["penalties_won_fwd"]=plrStats["penalties_won"];

                    
                    tpArr["through_balls_won_def"]=plrStats["through_balls_won"];
                    tpArr["through_balls_won_mid"]=plrStats["through_balls_won"];
                    tpArr["through_balls_won_fwd"]=plrStats["through_balls_won"];

                    
                    tpArr["through_balls_def"]=plrStats["through_balls"];
                    tpArr["through_balls_mid"]=plrStats["through_balls"];
                    tpArr["through_balls_fwd"]=plrStats["through_balls"];

                    // "name":"Defending","key":"def"
                    // "name":"Attacking","key":"fwd"
                    // "name":"Goal Keeping","key":"gk"
                    // "name":"Team Play","key":"mid"


                    plyFntyData["goalfor"] && arrayDataFwd.push({ "name": "Goal", "point": plyFntyData["goalfor"], "actual": tpArr["goalfor"] });
                    plyFntyData["penaltyscoredfor"] && arrayDataFwd.push({ "name": "Penalty Score", "point": plyFntyData["penaltyscoredfor"], "actual": tpArr["penaltyscoredfor"] });
                    plyFntyData["foul_concededfor"] && arrayDataDef.push({ "name": "Per Foul Conceded", "point": plyFntyData["foul_concededfor"], "actual": tpArr["foul_concededfor"] });
                    plyFntyData["cleansheetfwd"] && arrayDataDef.push({ "name": "Clean Sheet (Played > 60 min)", "point": plyFntyData["cleansheetfwd"], "actual": tpArr["cleansheetfwd"] });
                    plyFntyData["yellowcardfwd"] && arrayDataCom.push({ "name": "Yellow Card", "point": plyFntyData["yellowcardfwd"], "actual": tpArr["yellowcardfwd"] });
                    plyFntyData["redcardfwd"] && arrayDataCom.push({ "name": "Red Card", "point": plyFntyData["redcardfwd"], "actual": tpArr["redcardfwd"] });
                    plyFntyData["owngoalfwd"] && arrayDataCom.push({ "name": "Own Goal", "point": plyFntyData["owngoalfwd"], "actual": tpArr["owngoalfwd"] });
                    plyFntyData["penaltymissedfwd"] && arrayDataFwd.push({ "name": "Penalty Miss", "point": plyFntyData["penaltymissedfwd"], "actual": tpArr["penaltymissedfwd"] });
                    plyFntyData["tacklefwd"] && arrayDataMid.push({ "name": "Tackle won", "point": plyFntyData["tacklefwd"], "actual": tpArr["tacklefwd"] });
                    plyFntyData["fourpassesfwd"] && arrayDataMid.push({ "name": "4 Passes Completed", "point": plyFntyData["fourpassesfwd"], "actual": tpArr["fourpassesfwd"] });
                    plyFntyData["foulsdrawnfwd"] && arrayDataMid.push({ "name": "Foul won", "point": plyFntyData["foulsdrawnfwd"], "actual": tpArr["foulsdrawnfwd"] });
                    plyFntyData["interceptionsfwd"] && arrayDataDef.push({ "name": "Interception", "point": plyFntyData["interceptionsfwd"], "actual": tpArr["interceptionsfwd"] });
                    plyFntyData["duelswonfwd"] && arrayDataDef.push({ "name": "Duel Won", "point": plyFntyData["duelswonfwd"], "actual": tpArr["duelswonfwd"] });
                    plyFntyData["shot_off_targetfwd"] && arrayDataFwd.push({ "name": "Shot off Target", "point": plyFntyData["shot_off_targetfwd"], "actual": tpArr["shot_off_targetfwd"] });
                    plyFntyData["chancecreatedfwd"] && arrayDataMid.push({ "name": "Chance Created", "point": plyFntyData["chancecreatedfwd"], "actual": tpArr["chancecreatedfwd"] });
                    plyFntyData["threemispassfwd"] && arrayDataMid.push({ "name": "3 Misplaced passes", "point": plyFntyData["threemispassfwd"], "actual": tpArr["threemispassfwd"] });
                    plyFntyData["threegoalfwd"] && arrayDataFwd.push({ "name": "3 Goal Bonus", "point": plyFntyData["threegoalfwd"], "actual": tpArr["threegoalfwd"] });
                    plyFntyData["twogoalfwd"] && arrayDataFwd.push({ "name": "2 Goal Bonus", "point": plyFntyData["twogoalfwd"], "actual": tpArr["twogoalfwd"] });
                    plyFntyData["shot_on_targetfwd"] && arrayDataFwd.push({ "name": "Shot on Target", "point": plyFntyData["shot_on_targetfwd"], "actual": tpArr["shot_on_targetfwd"] });
                    plyFntyData["dribbles_completedfwd"] && arrayDataMid.push({ "name": "Dribbles Completed", "point": plyFntyData["dribbles_completedfwd"], "actual": tpArr["dribbles_completedfwd"] });
                    plyFntyData["playsixtyminfwd"] && arrayDataCom.push({ "name": "> 60 minutes played", "point": plyFntyData["playsixtyminfwd"], "actual": tpArr["playsixtyminfwd"] });
                    if (fbplayersdetail.position_id === 1) {
                        plyFntyData["goalsconcededfow"] && arrayDataGk.push({ "name": "Goal Conceded", "point": plyFntyData["goalsconcededfow"], "actual": tpArr["goalsconcededfow"] });
                    } else {
                        plyFntyData["goalsconcededfow"] && arrayDataDef.push({ "name": "Goal Conceded", "point": plyFntyData["goalsconcededfow"], "actual": tpArr["goalsconcededfow"] });
                    }
                    plyFntyData["assistfow"] && arrayDataFwd.push({ "name": "Assist", "point": plyFntyData["assistfow"], "actual": tpArr["assistfow"] });



                    plyFntyData["goalmid"] && arrayDataFwd.push({ "name": "Goal", "point": plyFntyData["goalmid"], "actual": tpArr["goalmid"] });
                    plyFntyData["cleansheetmid"] && arrayDataDef.push({ "name": "Clean Sheet (Played > 60 min)", "point": plyFntyData["cleansheetmid"], "actual": tpArr["cleansheetmid"] });
                    plyFntyData["yellowcardmid"] && arrayDataCom.push({ "name": "Yellow Card", "point": plyFntyData["yellowcardmid"], "actual": tpArr["yellowcardmid"] });
                    plyFntyData["redcardmid"] && arrayDataCom.push({ "name": "Red Card", "point": plyFntyData["redcardmid"], "actual": tpArr["redcardmid"] });
                    plyFntyData["owngoalmid"] && arrayDataCom.push({ "name": "Own Goal", "point": plyFntyData["owngoalmid"], "actual": tpArr["owngoalmid"] });
                    plyFntyData["penaltymissedmid"] && arrayDataFwd.push({ "name": "Penalty Miss", "point": plyFntyData["penaltymissedmid"], "actual": tpArr["penaltymissedmid"] });
                    plyFntyData["tacklemid"] && arrayDataMid.push({ "name": "Tackle won", "point": plyFntyData["tacklemid"], "actual": tpArr["tacklemid"] });
                    plyFntyData["fourpassesmid"] && arrayDataMid.push({ "name": "4 Passes Completed", "point": plyFntyData["fourpassesmid"], "actual": tpArr["fourpassesmid"] });

                    if (fbplayersdetail.position_id === 1) {
                        plyFntyData["goalsconcededmid"] && arrayDataGk.push({ "name": "Goal Conceded", "point": plyFntyData["goalsconcededmid"], "actual": tpArr["goalsconcededmid"] });
                    } else {
                        plyFntyData["goalsconcededmid"] && arrayDataDef.push({ "name": "Goal Conceded", "point": plyFntyData["goalsconcededmid"], "actual": tpArr["goalsconcededmid"] });
                    }
                    plyFntyData["penaltyscoredmid"] && arrayDataFwd.push({ "name": "Penalty Score", "point": plyFntyData["penaltyscoredmid"], "actual": tpArr["penaltyscoredmid"] });
                    plyFntyData["foulsdrawnmid"] && arrayDataMid.push({ "name": "Foul won", "point": plyFntyData["foulsdrawnmid"], "actual": tpArr["foulsdrawnmid"] });
                    plyFntyData["interceptionsmid"] && arrayDataDef.push({ "name": "Interception", "point": plyFntyData["interceptionsmid"], "actual": tpArr["interceptionsmid"] });
                    plyFntyData["duelswonmid"] && arrayDataDef.push({ "name": "Duel Won", "point": plyFntyData["duelswonmid"], "actual": tpArr["duelswonmid"] });
                    plyFntyData["shot_off_targetmid"] && arrayDataFwd.push({ "name": "Shot off Target", "point": plyFntyData["shot_off_targetmid"], "actual": tpArr["shot_off_targetmid"] });
                    plyFntyData["chancecreatedmid"] && arrayDataMid.push({ "name": "Chance Created", "point": plyFntyData["chancecreatedmid"], "actual": tpArr["chancecreatedmid"] });
                    plyFntyData["threemispassmid"] && arrayDataMid.push({ "name": "3 Misplaced passes", "point": plyFntyData["threemispassmid"], "actual": tpArr["threemispassmid"] });
                    plyFntyData["threegoalmid"] && arrayDataFwd.push({ "name": "3 Goal Bonus", "point": plyFntyData["threegoalmid"], "actual": tpArr["threegoalmid"] });
                    plyFntyData["twogoalmid"] && arrayDataFwd.push({ "name": "2 Goal Bonus", "point": plyFntyData["twogoalmid"], "actual": tpArr["twogoalmid"] });
                    plyFntyData["shot_on_targetmid"] && arrayDataFwd.push({ "name": "Shot on Target", "point": plyFntyData["shot_on_targetmid"], "actual": tpArr["shot_on_targetmid"] });
                    plyFntyData["foul_concededmid"] && arrayDataDef.push({ "name": "Per Foul Conceded", "point": plyFntyData["foul_concededmid"], "actual": tpArr["foul_concededmid"] });
                    plyFntyData["dribbles_completedmid"] && arrayDataMid.push({ "name": "Dribbles Completed", "point": plyFntyData["dribbles_completedmid"], "actual": tpArr["dribbles_completedmid"] });
                    plyFntyData["assistmid"] && arrayDataFwd.push({ "name": "Assist", "point": plyFntyData["assistmid"], "actual": tpArr["assistmid"] });
                    plyFntyData["playsixtyminmid"] && arrayDataCom.push({ "name": "> 60 minutes played", "point": plyFntyData["playsixtyminmid"], "actual": tpArr["playsixtyminmid"] });


                    plyFntyData["goalgk"] && arrayDataFwd.push({ "name": "Goal", "point": plyFntyData["goalgk"], "actual": tpArr["goalgk"] });
                    plyFntyData["cleansheetgk"] && arrayDataDef.push({ "name": "Clean Sheet (Played > 60 min)", "point": plyFntyData["cleansheetgk"], "actual": tpArr["cleansheetgk"] });
                    plyFntyData["penaltysavegk"] && arrayDataGk.push({ "name": "Penalty Save", "point": plyFntyData["penaltysavegk"], "actual": tpArr["penaltysavegk"] });
                    plyFntyData["yellowcardgk"] && arrayDataCom.push({ "name": "Yellow Card", "point": plyFntyData["yellowcardgk"], "actual": tpArr["yellowcardgk"] });
                    plyFntyData["redcardgk"] && arrayDataCom.push({ "name": "Red Card", "point": plyFntyData["redcardgk"], "actual": tpArr["redcardgk"] });
                    plyFntyData["owngoalgk"] && arrayDataCom.push({ "name": "Own Goal", "point": plyFntyData["owngoalgk"], "actual": tpArr["owngoalgk"] });


                    if (fbplayersdetail.position_id === 1) {
                        plyFntyData["goalsconcededgk"] && arrayDataGk.push({ "name": "Goal Conceded", "point": plyFntyData["goalsconcededgk"], "actual": tpArr["goalsconcededgk"] });
                    } else {
                        plyFntyData["goalsconcededgk"] && arrayDataDef.push({ "name": "Goal Conceded", "point": plyFntyData["goalsconcededgk"], "actual": tpArr["goalsconcededgk"] });
                    }

                    plyFntyData["penaltymissedgk"] && arrayDataFwd.push({ "name": "Penalty Miss", "point": plyFntyData["penaltymissedgk"], "actual": tpArr["penaltymissedgk"] });
                    plyFntyData["fourpassesgk"] && arrayDataMid.push({ "name": "4 Passes Completed", "point": plyFntyData["fourpassesgk"], "actual": tpArr["fourpassesgk"] });
                    plyFntyData["penaltyscoredgk"] && arrayDataFwd.push({ "name": "Penalty Score", "point": plyFntyData["penaltyscoredgk"], "actual": tpArr["penaltyscoredgk"] });
                    plyFntyData["threemispassgk"] && arrayDataMid.push({ "name": "3 Misplaced passes", "point": plyFntyData["threemispassgk"], "actual": tpArr["threemispassgk"] });
                    plyFntyData["foul_concededgk"] && arrayDataDef.push({ "name": "Per Foul Conceded", "point": plyFntyData["foul_concededgk"], "actual": tpArr["foul_concededgk"] });
                    plyFntyData["assistgk"] && arrayDataFwd.push({ "name": "Assist", "point": plyFntyData["assistgk"], "actual": tpArr["assistgk"] });
                    plyFntyData["playsixtymingk"] && arrayDataCom.push({ "name": "> 60 minutes played", "point": plyFntyData["playsixtymingk"], "actual": tpArr["playsixtymingk"] });





                    plyFntyData["goaldef"] && arrayDataFwd.push({ "name": "Goal", "point": plyFntyData["goaldef"], "actual": tpArr["goaldef"] });
                    plyFntyData["cleansheetdef"] && arrayDataDef.push({ "name": "Clean Sheet (Played > 60 min)", "point": plyFntyData["cleansheetdef"], "actual": tpArr["cleansheetdef"] });
                    plyFntyData["yellowcarddef"] && arrayDataCom.push({ "name": "Yellow Card", "point": plyFntyData["yellowcarddef"], "actual": tpArr["yellowcarddef"] });
                    plyFntyData["redcarddef"] && arrayDataCom.push({ "name": "Red Card", "point": plyFntyData["redcarddef"], "actual": tpArr["redcarddef"] });
                    plyFntyData["owngoaldef"] && arrayDataCom.push({ "name": "Own Goal", "point": plyFntyData["owngoaldef"], "actual": tpArr["owngoaldef"] });
                    plyFntyData["penaltymisseddef"] && arrayDataFwd.push({ "name": "Penalty Miss", "point": plyFntyData["penaltymisseddef"], "actual": tpArr["penaltymisseddef"] });
                    plyFntyData["tackledef"] && arrayDataMid.push({ "name": "Tackle won", "point": plyFntyData["tackledef"], "actual": tpArr["tackledef"] });
                    plyFntyData["fourpassesdef"] && arrayDataMid.push({ "name": "4 Passes Completed", "point": plyFntyData["fourpassesdef"], "actual": tpArr["fourpassesdef"] });


                    if (fbplayersdetail.position_id === 1) {
                        plyFntyData["goalsconcededdef"] && arrayDataGk.push({ "name": "Goal Conceded", "point": plyFntyData["goalsconcededdef"], "actual": tpArr["goalsconcededdef"] });
                    } else {
                        plyFntyData["goalsconcededdef"] && arrayDataDef.push({ "name": "Goal Conceded", "point": plyFntyData["goalsconcededdef"], "actual": tpArr["goalsconcededdef"] });
                    }

                    plyFntyData["penaltyscoreddef"] && arrayDataFwd.push({ "name": "Penalty Score", "point": plyFntyData["penaltyscoreddef"], "actual": tpArr["penaltyscoreddef"] });
                    plyFntyData["foulsdrawndef"] && arrayDataMid.push({ "name": "Foul won", "point": plyFntyData["foulsdrawndef"], "actual": tpArr["foulsdrawndef"] });
                    plyFntyData["interceptionsdef"] && arrayDataDef.push({ "name": "Interception", "point": plyFntyData["interceptionsdef"], "actual": tpArr["interceptionsdef"] });
                    plyFntyData["duelswondef"] && arrayDataDef.push({ "name": "Duel Won", "point": plyFntyData["duelswondef"], "actual": tpArr["duelswondef"] });
                    plyFntyData["shot_off_targetdef"] && arrayDataFwd.push({ "name": "Shot off Target", "point": plyFntyData["shot_off_targetdef"], "actual": tpArr["shot_off_targetdef"] });
                    plyFntyData["chancecreateddef"] && arrayDataMid.push({ "name": "Chance Created", "point": plyFntyData["chancecreateddef"], "actual": tpArr["chancecreateddef"] });
                    plyFntyData["threemispassdef"] && arrayDataMid.push({ "name": "3 Misplaced passes", "point": plyFntyData["threemispassdef"], "actual": tpArr["threemispassdef"] });
                    plyFntyData["threegoaldef"] && arrayDataFwd.push({ "name": "3 Goal Bonus", "point": plyFntyData["threegoaldef"], "actual": tpArr["threegoaldef"] });
                    plyFntyData["twogoaldef"] && arrayDataFwd.push({ "name": "2 Goal Bonus", "point": plyFntyData["twogoaldef"], "actual": tpArr["twogoaldef"] });
                    plyFntyData["shot_on_targetdef"] && arrayDataFwd.push({ "name": "Shot on Target", "point": plyFntyData["shot_on_targetdef"], "actual": tpArr["shot_on_targetdef"] });
                    plyFntyData["foul_concededdef"] && arrayDataDef.push({ "name": "Per Foul Conceded", "point": plyFntyData["foul_concededdef"], "actual": tpArr["foul_concededdef"] });
                    plyFntyData["dribbles_completeddef"] && arrayDataMid.push({ "name": "Dribbles Completed", "point": plyFntyData["dribbles_completeddef"], "actual": tpArr["dribbles_completeddef"] });
                    plyFntyData["assistdef"] && arrayDataFwd.push({ "name": "Assist", "point": plyFntyData["assistdef"], "actual": tpArr["assistdef"] });
                    plyFntyData["playsixtymindef"] && arrayDataCom.push({ "name": "> 60 minutes played", "point": plyFntyData["playsixtymindef"], "actual": tpArr["playsixtymindef"] });


                    plyFntyData["punches"] && arrayDataCom.push({ "name": "Punches", "point": plyFntyData["punches"], "actual": tpArr["punches"] });


                    ////////NEW///////////
                    
                    plyFntyData["shots_off_target_gk"] && arrayDataGk.push({"name":"Shots Off Target","point":plyFntyData["shots_off_target_gk"],"actual":tpArr["shots_off_target_gk"]});
                    plyFntyData["shots_off_target_def"] && arrayDataDef.push({"name":"Shots Off Target","point":plyFntyData["shots_off_target_def"],"actual":tpArr["shots_off_target_def"]});
                    plyFntyData["shots_off_target_mid"] && arrayDataMid.push({"name":"Shots Off Target","point":plyFntyData["shots_off_target_mid"],"actual":tpArr["shots_off_target_mid"]});
                    plyFntyData["shots_off_target_fwd"] && arrayDataFwd.push({"name":"Shots Off Target","point":plyFntyData["shots_off_target_fwd"],"actual":tpArr["shots_off_target_fwd"]});

                    
                    plyFntyData["shots_blocked_gk"] && arrayDataGk.push({"name":"Shots Blocked","point":plyFntyData["shots_blocked_gk"],"actual":tpArr["shots_blocked_gk"]});
                    plyFntyData["shots_blocked_def"] && arrayDataDef.push({"name":"Shots Blocked","point":plyFntyData["shots_blocked_def"],"actual":tpArr["shots_blocked_def"]});
                    plyFntyData["shots_blocked_mid"] && arrayDataMid.push({"name":"Shots Blocked","point":plyFntyData["shots_blocked_mid"],"actual":tpArr["shots_blocked_mid"]});
                    plyFntyData["shots_blocked_fwd"] && arrayDataFwd.push({"name":"Shots Blocked","point":plyFntyData["shots_blocked_fwd"],"actual":tpArr["shots_blocked_fwd"]});

                    
                    plyFntyData["long_passes_gk"] && arrayDataGk.push({"name":"Long Passes","point":plyFntyData["long_passes_gk"],"actual":tpArr["long_passes_gk"]}); 
                    plyFntyData["long_passes_def"] && arrayDataDef.push({"name":"Long Passes","point":plyFntyData["long_passes_def"],"actual":tpArr["long_passes_def"]});
                    plyFntyData["long_passes_mid"] && arrayDataMid.push({"name":"Long_passes","point":plyFntyData["long_passes_mid"],"actual":tpArr["long_passes_mid"]});
                    plyFntyData["long_passes_fwd"] && arrayDataFwd.push({"name":"Long_passes","point":plyFntyData["long_passes_fwd"],"actual":tpArr["long_passes_fwd"]});

                    
                    plyFntyData["short_passes_gk"] && arrayDataGk.push({"name":"Short_passes","point":plyFntyData["short_passes_gk"],"actual":tpArr["short_passes_gk"]});
                    plyFntyData["short_passes_def"] && arrayDataDef.push({"name":"Short Passes","point":plyFntyData["short_passes_def"],"actual":tpArr["short_passes_def"]});
                    plyFntyData["short_passes_mid"] && arrayDataMid.push({"name":"Short Passes","point":plyFntyData["short_passes_mid"],"actual":tpArr["short_passes_mid"]});
                    plyFntyData["short_passes_fwd"] && arrayDataFwd.push({"name":"Short Passes","point":plyFntyData["short_passes_fwd"],"actual":tpArr["short_passes_fwd"]});

                    
                    plyFntyData["challenges_gk"] && arrayDataGk.push({"name":"Challenges","point":plyFntyData["challenges_gk"],"actual":tpArr["challenges_gk"]});
                    plyFntyData["challenges_def"] && arrayDataDef.push({"name":"Challenges","point":plyFntyData["challenges_def"],"actual":tpArr["challenges_def"]}); 
                    plyFntyData["challenges_mid"] && arrayDataMid.push({"name":"Challenges","point":plyFntyData["challenges_mid"],"actual":tpArr["challenges_mid"]}); 
                    plyFntyData["challenges_fwd"] && arrayDataFwd.push({"name":"Challenges","point":plyFntyData["challenges_fwd"],"actual":tpArr["challenges_fwd"]}); 

                    
                    plyFntyData["yellowcards_gk"] && arrayDataGk.push({"name":"Yellowcards","point":plyFntyData["yellowcards_gk"],"actual":tpArr["yellowcards_gk"]}); 
                    plyFntyData["yellowcards_def"] && arrayDataDef.push({"name":"Yellowcards","point":plyFntyData["yellowcards_def"],"actual":tpArr["yellowcards_def"]});
                    plyFntyData["yellowcards_mid"] && arrayDataMid.push({"name":"Yellowcards","point":plyFntyData["yellowcards_mid"],"actual":tpArr["yellowcards_mid"]});
                    plyFntyData["yellowcards_fwd"] && arrayDataFwd.push({"name":"Yellowcards","point":plyFntyData["yellowcards_fwd"],"actual":tpArr["yellowcards_fwd"]});

                    
                    plyFntyData["clearances_gk"] && arrayDataGk.push({"name":"Clearances","point":plyFntyData["clearances_gk"],"actual":tpArr["clearances_gk"]});
                    plyFntyData["clearances_def"] && arrayDataDef.push({"name":"Clearances","point":plyFntyData["clearances_def"],"actual":tpArr["clearances_def"]}); 
                    plyFntyData["clearances_mid"] && arrayDataMid.push({"name":"Clearances","point":plyFntyData["clearances_mid"],"actual":tpArr["clearances_mid"]}); 
                    plyFntyData["clearances_fwd"] && arrayDataFwd.push({"name":"Clearances","point":plyFntyData["clearances_fwd"],"actual":tpArr["clearances_fwd"]}); 
                    
                    plyFntyData["saves_inside_box_gk"] && arrayDataGk.push({"name":"Saves Inside Box","point":plyFntyData["saves_inside_box_gk"],"actual":tpArr["saves_inside_box_gk"]});

                    
                    plyFntyData["dribbled_past_gk"] && arrayDataGk.push({"name":"Dribbled Past","point":plyFntyData["dribbled_past_gk"],"actual":tpArr["dribbled_past_gk"]});
                    plyFntyData["dribbled_past_def"] && arrayDataDef.push({"name":"Dribbled Past","point":plyFntyData["dribbled_past_def"],"actual":tpArr["dribbled_past_def"]});
                    plyFntyData["dribbled_past_mid"] && arrayDataMid.push({"name":"Dribbled Past","point":plyFntyData["dribbled_past_mid"],"actual":tpArr["dribbled_past_mid"]});
                    plyFntyData["dribbled_past_fwd"] && arrayDataFwd.push({"name":"Dribbled Past","point":plyFntyData["dribbled_past_fwd"],"actual":tpArr["dribbled_past_fwd"]});

                    
                    plyFntyData["penalties_saved_gk"] && arrayDataGk.push({"name":"penalties_saved","point":plyFntyData["penalties_saved_gk"],"actual":tpArr["penalties_saved_gk"]}); 

                    
                    plyFntyData["rating_gk"] && arrayDataGk.push({"name":"Rating","point":plyFntyData["rating_gk"],"actual":tpArr["rating_gk"]});
                    plyFntyData["rating_def"] && arrayDataDef.push({"name":"Rating","point":plyFntyData["rating_def"],"actual":tpArr["rating_def"]}); 
                    plyFntyData["rating_mid"] && arrayDataMid.push({"name":"Rating","point":plyFntyData["rating_mid"],"actual":tpArr["rating_mid"]}); 
                    plyFntyData["rating_fwd"] && arrayDataFwd.push({"name":"Rating","point":plyFntyData["rating_fwd"],"actual":tpArr["rating_fwd"]}); 

                    
                    plyFntyData["long_balls_won_gk"] && arrayDataGk.push({"name":"Long Balls Won","point":plyFntyData["long_balls_won_gk"],"actual":tpArr["long_balls_won_gk"]});
                    plyFntyData["long_balls_won_def"] && arrayDataDef.push({"name":"Long Balls Won","point":plyFntyData["long_balls_won_def"],"actual":tpArr["long_balls_won_def"]}); 
                    plyFntyData["long_balls_won_mid"] && arrayDataMid.push({"name":"Long Balls Won","point":plyFntyData["long_balls_won_mid"],"actual":tpArr["long_balls_won_mid"]}); 
                    plyFntyData["long_balls_won_fwd"] && arrayDataFwd.push({"name":"Long Balls Won","point":plyFntyData["long_balls_won_fwd"],"actual":tpArr["long_balls_won_fwd"]}); 

                    
                    plyFntyData["long_balls_gk"] && arrayDataGk.push({"name":"Long Balls","point":plyFntyData["long_balls_gk"],"actual":tpArr["long_balls_gk"]});
                    plyFntyData["long_balls_def"] && arrayDataDef.push({"name":"Long Balls","point":plyFntyData["long_balls_def"],"actual":tpArr["long_balls_def"]}); 
                    plyFntyData["long_balls_mid"] && arrayDataMid.push({"name":"Long Balls","point":plyFntyData["long_balls_mid"],"actual":tpArr["long_balls_mid"]}); 
                    plyFntyData["long_balls_fwd"] && arrayDataFwd.push({"name":"Long Balls","point":plyFntyData["long_balls_fwd"],"actual":tpArr["long_balls_fwd"]}); 

                    
                    plyFntyData["matches_gk"] && arrayDataGk.push({"name":"Matches","point":plyFntyData["matches_gk"],"actual":tpArr["matches_gk"]}); 
                    plyFntyData["matches_def"] && arrayDataDef.push({"name":"Matches_","point":plyFntyData["matches_def"],"actual":tpArr["matches_def"]});
                    plyFntyData["matches_mid"] && arrayDataMid.push({"name":"Matches_","point":plyFntyData["matches_mid"],"actual":tpArr["matches_mid"]});
                    plyFntyData["matches_fwd"] && arrayDataFwd.push({"name":"Matches_","point":plyFntyData["matches_fwd"],"actual":tpArr["matches_fwd"]});

                    
                    plyFntyData["appearances_gk"] && arrayDataGk.push({"name":"Appearances","point":plyFntyData["appearances_gk"],"actual":tpArr["appearances_gk"]}); 
                    plyFntyData["appearances_def"] && arrayDataDef.push({"name":"Appearances_","point":plyFntyData["appearances_def"],"actual":tpArr["appearances_def"]});
                    plyFntyData["appearances_mid"] && arrayDataMid.push({"name":"Appearances_","point":plyFntyData["appearances_mid"],"actual":tpArr["appearances_mid"]});
                    plyFntyData["appearances_fwd"] && arrayDataFwd.push({"name":"Appearances_","point":plyFntyData["appearances_fwd"],"actual":tpArr["appearances_fwd"]});

                    
                    plyFntyData["bench_gk"] && arrayDataGk.push({"name":"Bench","point":plyFntyData["bench_gk"],"actual":tpArr["bench_gk"]});
                    plyFntyData["bench_def"] && arrayDataDef.push({"name":"Bench","point":plyFntyData["bench_def"],"actual":tpArr["bench_def"]});
                    plyFntyData["bench_mid"] && arrayDataMid.push({"name":"Bench","point":plyFntyData["bench_mid"],"actual":tpArr["bench_mid"]});
                    plyFntyData["bench_fwd"] && arrayDataFwd.push({"name":"Bench","point":plyFntyData["bench_fwd"],"actual":tpArr["bench_fwd"]});

                    
                    plyFntyData["error_lead_to_goal_gk"] && arrayDataGk.push({"name":"Error Lead To Goal","point":plyFntyData["error_lead_to_goal_gk"],"actual":tpArr["error_lead_to_goal_gk"]});
                    plyFntyData["error_lead_to_goal_def"] && arrayDataDef.push({"name":"Error Lead To Goal","point":plyFntyData["error_lead_to_goal_def"],"actual":tpArr["error_lead_to_goal_def"]}); 
                    plyFntyData["error_lead_to_goal_mid"] && arrayDataMid.push({"name":"Error Lead To Goal","point":plyFntyData["error_lead_to_goal_mid"],"actual":tpArr["error_lead_to_goal_mid"]}); 
                    plyFntyData["error_lead_to_goal_fwd"] && arrayDataFwd.push({"name":"Error Lead To Goal","point":plyFntyData["error_lead_to_goal_fwd"],"actual":tpArr["error_lead_to_goal_fwd"]}); 

                    
                    plyFntyData["offsides_provoked_def"] && arrayDataDef.push({"name":"Offsides Provoked","point":plyFntyData["offsides_provoked_def"],"actual":tpArr["offsides_provoked_def"]});
                    plyFntyData["offsides_provoked_mid"] && arrayDataMid.push({"name":"Offsides Provoked","point":plyFntyData["offsides_provoked_mid"],"actual":tpArr["offsides_provoked_mid"]});

                    
                    plyFntyData["offsides_def"] && arrayDataDef.push({"name":"Offsides","point":plyFntyData["offsides_def"],"actual":tpArr["offsides_def"]});
                    plyFntyData["offsides_mid"] && arrayDataMid.push({"name":"Offsides","point":plyFntyData["offsides_mid"],"actual":tpArr["offsides_mid"]});
                    plyFntyData["offsides_fwd"] && arrayDataFwd.push({"name":"Offsides","point":plyFntyData["offsides_fwd"],"actual":tpArr["offsides_fwd"]});


                    plyFntyData["hit_woodwork_def"] && arrayDataDef.push({"name":"Hit Woodwork","point":plyFntyData["hit_woodwork_def"],"actual":tpArr["hit_woodwork_def"]});
                    plyFntyData["hit_woodwork_mid"] && arrayDataMid.push({"name":"Hit Woodwork","point":plyFntyData["hit_woodwork_mid"],"actual":tpArr["hit_woodwork_mid"]});
                    plyFntyData["hit_woodwork_fwd"] && arrayDataFwd.push({"name":"Hit Woodwork","point":plyFntyData["hit_woodwork_fwd"],"actual":tpArr["hit_woodwork_fwd"]});

                    
                    plyFntyData["successful_headers_def"] && arrayDataDef.push({"name":"Successful Headers","point":plyFntyData["successful_headers_def"],"actual":tpArr["successful_headers_def"]}); 
                    plyFntyData["successful_headers_mid"] && arrayDataMid.push({"name":"Successful Headers","point":plyFntyData["successful_headers_mid"],"actual":tpArr["successful_headers_mid"]}); 
                    plyFntyData["successful_headers_fwd"] && arrayDataFwd.push({"name":"Successful Headers","point":plyFntyData["successful_headers_fwd"],"actual":tpArr["successful_headers_fwd"]}); 

                    
                    plyFntyData["headers_def"] && arrayDataDef.push({"name":"Headers","point":plyFntyData["headers_def"],"actual":tpArr["headers_def"]});
                    plyFntyData["headers_mid"] && arrayDataMid.push({"name":"Headers","point":plyFntyData["headers_mid"],"actual":tpArr["headers_mid"]});
                    plyFntyData["headers_fwd"] && arrayDataFwd.push({"name":"Headers","point":plyFntyData["headers_fwd"],"actual":tpArr["headers_fwd"]});

                    
                    plyFntyData["dispossessed_def"] && arrayDataDef.push({"name":"Dispossessed","point":plyFntyData["dispossessed_def"],"actual":tpArr["dispossessed_def"]});
                    plyFntyData["dispossessed_mid"] && arrayDataMid.push({"name":"Dispossessed","point":plyFntyData["dispossessed_mid"],"actual":tpArr["dispossessed_mid"]});
                    plyFntyData["dispossessed_fwd"] && arrayDataFwd.push({"name":"Dispossessed","point":plyFntyData["dispossessed_fwd"],"actual":tpArr["dispossessed_fwd"]});

                    
                    plyFntyData["total_crosses_def"] && arrayDataDef.push({"name":"Total Crosses","point":plyFntyData["total_crosses_def"],"actual":tpArr["total_crosses_def"]});
                    plyFntyData["total_crosses_mid"] && arrayDataMid.push({"name":"Total Crosses","point":plyFntyData["total_crosses_mid"],"actual":tpArr["total_crosses_mid"]});
                    plyFntyData["total_crosses_fwd"] && arrayDataFwd.push({"name":"Total Crosses","point":plyFntyData["total_crosses_fwd"],"actual":tpArr["total_crosses_fwd"]});

                    
                    plyFntyData["accurate_crosses_def"] && arrayDataDef.push({"name":"Accurate Crosses","point":plyFntyData["accurate_crosses_def"],"actual":tpArr["accurate_crosses_def"]});
                    plyFntyData["accurate_crosses_mid"] && arrayDataMid.push({"name":"Accurate Crosses","point":plyFntyData["accurate_crosses_mid"],"actual":tpArr["accurate_crosses_mid"]});
                    plyFntyData["accurate_crosses_fwd"] && arrayDataFwd.push({"name":"Accurate Crosses","point":plyFntyData["accurate_crosses_fwd"],"actual":tpArr["accurate_crosses_fwd"]});

                    
                    plyFntyData["total_duels_def"] && arrayDataDef.push({"name":"Total Duels","point":plyFntyData["total_duels_def"],"actual":tpArr["total_duels_def"]});
                    plyFntyData["total_duels_mid"] && arrayDataMid.push({"name":"Total Duels","point":plyFntyData["total_duels_mid"],"actual":tpArr["total_duels_mid"]});
                    plyFntyData["total_duels_fwd"] && arrayDataFwd.push({"name":"Total Duels","point":plyFntyData["total_duels_fwd"],"actual":tpArr["total_duels_fwd"]});

                    
                    plyFntyData["aerials_won_def"] && arrayDataDef.push({"name":"Aerials Won","point":plyFntyData["aerials_won_def"],"actual":tpArr["aerials_won_def"]});
                    plyFntyData["aerials_won_mid"] && arrayDataMid.push({"name":"Aerials Won","point":plyFntyData["aerials_won_mid"],"actual":tpArr["aerials_won_mid"]});
                    plyFntyData["aerials_won_fwd"] && arrayDataFwd.push({"name":"Aerials Won","point":plyFntyData["aerials_won_fwd"],"actual":tpArr["aerials_won_fwd"]});

                    
                    plyFntyData["penalties_won_def"] && arrayDataDef.push({"name":"Penalties Won","point":plyFntyData["penalties_won_def"],"actual":tpArr["penalties_won_def"]});
                    plyFntyData["penalties_won_mid"] && arrayDataMid.push({"name":"Penalties Won","point":plyFntyData["penalties_won_mid"],"actual":tpArr["penalties_won_mid"]});
                    plyFntyData["penalties_won_fwd"] && arrayDataFwd.push({"name":"Penalties Won","point":plyFntyData["penalties_won_fwd"],"actual":tpArr["penalties_won_fwd"]});

                    
                    plyFntyData["through_balls_won_def"] && arrayDataDef.push({"name":"Through Balls Won","point":plyFntyData["through_balls_won_def"],"actual":tpArr["through_balls_won_def"]});
                    plyFntyData["through_balls_won_mid"] && arrayDataMid.push({"name":"Through Balls Won","point":plyFntyData["through_balls_won_mid"],"actual":tpArr["through_balls_won_mid"]});
                    plyFntyData["through_balls_won_fwd"] && arrayDataFwd.push({"name":"Through Balls Won","point":plyFntyData["through_balls_won_fwd"],"actual":tpArr["through_balls_won_fwd"]});

                    
                    plyFntyData["through_balls_def"] && arrayDataDef.push({"name":"Through Balls","point":plyFntyData["through_balls_def"],"actual":tpArr["through_balls_def"]});
                    plyFntyData["through_balls_mid"] && arrayDataMid.push({"name":"Through Balls","point":plyFntyData["through_balls_mid"],"actual":tpArr["through_balls_mid"]});
                    plyFntyData["through_balls_fwd"] && arrayDataFwd.push({"name":"Through Balls","point":plyFntyData["through_balls_fwd"],"actual":tpArr["through_balls_fwd"]});



                    totalpt = plyFntyData["tp"];
                    plyFntyData["penaltymissed"] && arrayDataFwd.push({ "name": "Penalty Miss", "point": plyFntyData["penaltymissed"], "actual": tpArr["penaltymissed"] });
                    if (fbplayersdetail.position_id === 1) {
                        plyFntyData["goalsaved"] && arrayDataGk.push({ "name": "Saves", "point": plyFntyData["goalsaved"], "actual": tpArr["goalsaved"] });
                    } else {
                        plyFntyData["goalsaved"] && arrayDataDef.push({ "name": "Saves", "point": plyFntyData["goalsaved"], "actual": tpArr["goalsaved"] });
                    }
                    plyFntyData["playing11"] && arrayDataCom.push({ "name": "Appearance (Starting 11 or sub)", "point": plyFntyData["playing11"], "actual": tpArr["playing11"] });
                    /////////////////////////////////////////////

                    arrayData.push({ "name": "General", "key": "def", "data": arrayDataCom });
                    arrayDataDef.length > 0 && arrayData.push({ "name": "Defending", "key": "def", "data": arrayDataDef });
                    arrayDataFwd.length > 0 && arrayData.push({ "name": "Attacking", "key": "fwd", "data": arrayDataFwd });
                    arrayDataGk.length > 0 && arrayData.push({ "name": "Goal Keeping", "key": "gk", "data": arrayDataGk });
                    arrayDataMid.length > 0 && arrayData.push({ "name": "Game Play", "key": "mid", "data": arrayDataMid });

                }

                let ply_statis=player_statistics?.statistics ? player_statistics.statistics:{};
                
                let playerDetail={"player_detail":{"stats":{"data":[ply_statis]}}};
                
                newplydat["totalpt"] = totalpt;
                let playe_detail = {
                    player_detail: newplydat,
                    performance_detail: player_performance_list,
                    player_statistics: playerDetail,
                    "fantasy_points": arrayData
                    //players_fantasy_data: players_fantasy_data
                }

                return res.send(response(playe_detail, "player detail find successfully", true));
            }

        } catch (error) {
            console.log("error--->>>", error);
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    series_player_detail: async (req, res, next) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const CktTeamsSchema = createCktTeamsModel(cktDbConnection);
            const CktPlayerMetaDataSchema = createCktPlayerMetaDataModel(cktDbConnection);

            //     const params = req.body
            //  let playerdetail=   await cricketsplayers.aggregate([
            //         {
            //         $match:{"teama.cid":125424}
            //         },
            //            { $project: { teama:1,teamb:1 }},
            //            { $project: { warehouses: { $objectToArray: "$$ROOT" }} },
            //            { $unwind: "$warehouses" },
            //            { $group: { _id: "$warehouses.v.team_id", players: {"$first":"$warehouses.v.players"} } }
            //         ])

            const params = req.body
            let cktplydata = {}
            let cricketplayersdetail = await CktTeamsSchema.findOne({ "players": { "$elemMatch": { "pid": params.player_id } } }, { "players.$": 1 })

            cktplydata = (cricketplayersdetail && cricketplayersdetail["players"][0]) ? cricketplayersdetail["players"][0] : {};
            // "players":  { "pid": params.player_id }  }, { "players": 1 })


            let plyMeta = await CktPlayerMetaDataSchema.findOne(
                { pid: params.player_id }
            )

            let newplydat = {}
            if (cktplydata["pid"]) {
                newplydat = {
                    "player_id": cktplydata.pid,
                    "playing_role": cktplydata.playing_role,
                    "batting_style": cktplydata.batting_style,
                    "bowling_style": cktplydata.bowling_style,
                    "recent_appearance": cktplydata.recent_appearance,
                    "recent_match:": cktplydata.recent_match,
                    "rating": cktplydata.fantasy_player_rating,
                    "name": cktplydata.title,
                    "country": cktplydata.nationality,
                    "DOB": cktplydata.birthdate,
                    "image_path": (plyMeta && plyMeta.logo_url) ? `${env.awsimgurl}profile_doc/${plyMeta.logo_url}` : "",
                    // "image_path": cktplydata.thumb_url,
                    "is_playing": cktplydata.is_playing
                }

                return res.send(response(newplydat, "player detail find successfully", true));

            }

            const footballDbConnection = await connectWithFootballDb();
            const FbTeamsSchema = createFbTeamsModel(footballDbConnection);

            //football
            let plyData = {};
            let fbplayersdetail = await FbTeamsSchema.findOne({
                "squad.data": { "$elemMatch": { "player_id": params.player_id } }
            }, { "squad.data.$": 1 })


            plyData = (fbplayersdetail && fbplayersdetail["squad"]["data"][0]) ? fbplayersdetail["squad"]["data"][0] : {};
            //  if (!plyData["player_id"]) {
            //      let fbplayersdetail11 = await fbplayers.findOne({ "teamb.squad.data": { "$elemMatch": { "player_id": params.player_id } } }, { "teamb.squad.data.$": 1 })

            //      plyData = (fbplayersdetail11 && fbplayersdetail11["teamb"]["squad"]["data"][0]) ? fbplayersdetail11["teamb"]["squad"]["data"][0] : {};
            //  }

            if (plyData["player_id"]) {
                let newplydat = {
                    is_substitue: Joi.number().required(),
                    team_count: Joi.number(), laying
                }
                return res.send(response(newplydat, "player detail find successfully", true));
            } else {
                return res.send(response({}, "player is not find", false));
            }


        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    series_add_player: async (req, res, next) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const CktPlayersSchema = createCktPlayersModel(cktDbConnection);

            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UserPlayersCktSchema = createUserPlayersCktModel(vendorDbConnection);
            const UserPlayersFbSchema = createUserPlayersFbModel(vendorDbConnection);
            const UserCktSeriesTeamSchema = createUserCktSeriesTeamModel(vendorDbConnection);
            const UserFbLeagueSchema = createUserFbLeagueModel(vendorDbConnection);

            const params = req.body;

            // const user = req.user
            let SendPlayerData = {}
            let userplymMain = null;
            let userteamMain = null;
            let typeName = "";
            // let SendPlayerData = {}
            if (params.type == "Cricket") {
                userplymMain = UserPlayersCktSchema;
                userteamMain = UserCktSeriesTeamSchema;
                typeName = "Cricket";
                let cktPlayer = await CktPlayersSchema.aggregate([
                    { "$match": { "league_id": params.league_id } },
                    {
                        $lookup:
                        {
                            from: "ckt_player_details",
                            localField: "pid",
                            foreignField: "pid",
                            as: "player_details",
                        },
                    },
                    {
                        $unwind: {
                            "path": "$player_details",
                            "preserveNullAndEmptyArrays": true
                        }
                    },
                    {
                        "$group":
                        {
                            _id: "$pid", "pid": { $first: "$pid" }, "playing_role": { $first: "$player_details.playing_role" }, "team_id": { $first: "$tid" }, "country": { $first: "$player_details.country" }
                        }
                    }
                ]);//.find({ "cid": params.league_id })

                //let newdata = cktPlayer.map((item5, i) => {

                cktPlayer.map((item6, i) => {
                    SendPlayerData[item6.pid] = {
                        playing_role: item6.playing_role,
                        country: item6.country,
                        team_id: item6.team_id
                    }
                })
                // })
            } else if (params.type == "Football") {
                const footballDbConnection = await connectWithFootballDb();
                const FbPlayerDetailsSchema = createFbPlayerDetailsModel(footballDbConnection);

                userplymMain = UserPlayersFbSchema;
                userteamMain = UserFbLeagueSchema;//userteamfb;
                typeName = "Football";
                //let fbplayer = await fbteams.find({ "season_id": params.league_id })
                let fbPlayerList = await FbPlayerDetailsSchema.aggregate([{ "$match": { "season_id": params.league_id } },
                {
                    "$group":
                    {
                        _id: "$pid", "position_id": { $first: "$position_id" }, "tid": { $first: "$tid" }
                    }
                }
                ]);

                let team_players = await fbPlayerList && fbPlayerList.map((item3, i) => {


                    SendPlayerData[item3._id] = {
                        playing_role: item3?.position_id,
                        team_id: item3?.tid,
                    }

                })

            }


            params.userid = req.user.id

            // params.pid = pid

            let array = params.pid
            let uniqueArray = Array.from(new Set(array));
            let lengthPlayers = uniqueArray.length;


            if (lengthPlayers == settingDetail.seriesPlyCount) {

                //let oldpalyerdata = await userplymckt.distinct("pid", { match_id: params.match_id,userid:req.user.id })
                let oldpalyerdata = await userplymMain.aggregate([
                    {
                        $match: { league_id: params.league_id, userid: params.userid }
                    },
                    {
                        $group: {
                            _id: { "uteamid": "$uteamid" }, "pid": { $push: "$pid" }
                        }
                    }
                ])

                let matchallTeam = 0;
                oldpalyerdata.forEach((oldItem) => {
                    let oldPlayerList = oldItem.pid.sort();
                    let newPlyList = params.pid.sort();

                    // newdata = newdata.sort()
                    let chkMatch = 0;
                    oldPlayerList.map((itempId) => {

                        chkMatch = chkMatch + ((newPlyList.indexOf(itempId) > -1) ? 1 : 0);
                    })

                    if (oldPlayerList.length > 0 && oldPlayerList.length == chkMatch) {
                        matchallTeam++;
                    } else {

                    }
                    //oldpalyerdata.every((v, i) => v === newPlyList);
                })


                if (matchallTeam > 0) {
                    return res.send(response({}, typeName + " Player team already created!.", false));
                } else {
                    if(params?.contest_id){
                        params.contest_id=ObjectId(params.contest_id);
                    }
                    let playerteam = await userteamMain.create(params);

                    let uteamid = playerteam._id
                    params.uteamid = uteamid

                    await params.pid.forEach(async (item) => {

                        let playing_role = (SendPlayerData && SendPlayerData[item] && SendPlayerData[item]["playing_role"]) ? SendPlayerData[item]["playing_role"] : null;
                        let team_id = (SendPlayerData && SendPlayerData[item] && SendPlayerData[item]["team_id"]) ? SendPlayerData[item]["team_id"] : null;
                        let createData = {
                            pid: item,
                            league_id: params.league_id,
                            uteamid: ObjectID(params.uteamid),
                            userid: params.userid,
                            playing_role: playing_role,
                            mteam_id: team_id,
                            team_count: params.team_count,
                            // teamb_count: params.teamb_count,
                            team_no: params.team_no
                            //team_count:params.team_count
                        }

                        let userplymcktSave = await userplymMain.create(createData);

                    })
                    return res.send(response({ uteamid: params.uteamid }, "Add " + typeName + " Player Successfully!.", true));
                }

            } else {
                return res.send(response({}, "List of player should be " + settingDetail.seriesPlyCount + ".", false));
            }

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    update_substitute_player_series: async (req, res, next) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UserPlayersCktSchema = createUserPlayersCktModel(vendorDbConnection);
            const UserPlayersFbSchema = createUserPlayersFbModel(vendorDbConnection);

            const params = req.body;
            const user = req.user
            params.userid = req.user.id;
            let userplysSchema = null;
            if (params.type == "Cricket") {
                userplysSchema = UserPlayersCktSchema;
            } else {
                userplysSchema = UserPlayersFbSchema;
            }

            console.log("ppp--->>", params.type, { 'match_ids': params.match_id, league_id: params.league_id, user_id: req.user.id, uteamid: params.uteamid, pid: { "$nin": params.pid } })
            await userplysSchema.updateMany({ league_id: params.league_id, userid: req.user.id, uteamid: ObjectID(params.uteamid), pid: { "$nin": params.pid } },
                {
                    $pull: {
                        'match_ids': params.match_id
                    },
                    $addToSet: {
                        'allmatch_id': params.match_id
                    }
                });

            await userplysSchema.updateMany({ league_id: params.league_id, userid: req.user.id, uteamid: ObjectID(params.uteamid), pid: { "$in": params.pid } },
                {
                    $addToSet: {
                        'allmatch_id': params.match_id,
                        'match_ids': params.match_id
                    }
                });

            return res.send(response({ uteamid: params.uteamid }, "Update " + params.type + " Player Successfully!.", true));
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    substitue_add_series_player: async (req, res, next) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UserPlayersCktSchema = createUserPlayersCktModel(vendorDbConnection);
            const UserPlayersFbSchema = createUserPlayersFbModel(vendorDbConnection);

            const params = req.body;
            const user = req.user
            params.userid = req.user.id;


            if (params.type == "Cricket") {
                const cktDbConnection = await connectWithCricketDb();
                const CktPlayersSchema = createCktPlayersModel(cktDbConnection);

                //limit and pagination 
                //params.userid = req.user.id
                //let playerteam = await userteamsckt(req.user.apikey).create(params);

                // let uteamid = playerteam._id
                // params.uteamid = uteamid
                // params.pid = pid

                let array = params.pid
                let uniqueArray = Array.from(new Set(array));
                let lengthPlayers = uniqueArray.length;

                let plyList = await CktPlayersSchema.aggregate([
                    { "$match": { "pid": { "$in": params.pid } } },
                    {
                        $lookup:
                        {
                            from: "ckt_player_details",
                            localField: "pid",
                            foreignField: "pid",
                            as: "player_details",
                        },
                    },
                    {
                        $unwind: {
                            "path": "$player_details",
                            "preserveNullAndEmptyArrays": true
                        }
                    },
                    {
                        "$group":
                        {
                            _id: "$pid", "pid": { $first: "$pid" }, "playing_role": { $first: "$player_details.playing_role" }, "team_id": { $first: "$tid" }, "country": { $first: "$player_details.country" }
                        }
                    }
                ]);
                //.find({ "pid": { "$in": params.pid } })
                let plyObj = {};
                plyList.forEach((itemPly) => {
                    plyObj[itemPly.pid] = itemPly
                })


                if (lengthPlayers == settingDetail.substitutePlyCount) {
                    let oldpalyerdata = await UserPlayersCktSchema.distinct("pid", { league_id: params.league_id })

                    let newPlyList = params.pid.sort()
                    // newdata = newdata.sort()
                    let checkPlyDup = oldpalyerdata.every((v, i) => v === newPlyList);


                    if (!checkPlyDup) {
                        if (params.uteamid) {
                            await UserPlayersCktSchema.deleteMany({ league_id: params.league_id, uteamid: ObjectID(params.uteamid), is_substitue: 1 });
                        }

                        for (let i = 0; i < params.pid.length; i++) {

                            let createData = {
                                pid: params.pid[i],
                                league_id: params.league_id,
                                uteamid: params.uteamid,
                                is_substitue: 1,
                                team_count: params.team_count,
                                team_no: params.team_no,
                                userid: params.userid,
                                mteam_id: plyObj[params.pid[i]]["team_id"],
                                playing_role: plyObj[params.pid[i]]["playing_role"],
                            }


                            await UserPlayersCktSchema.create(createData);

                        }
                    }

                    return res.send(response({ uteamid: params.uteamid }, "Add Cricket Player Successfully!.", true));

                } else {
                    return res.send(response({}, "List of player should be " + settingDetail.substitutePlyCount + ".", false));
                }


            } else if (params.type == "Football") {
                const footballDbConnection = await connectWithFootballDb();
                const FbPlayerDetailsSchema = createFbPlayerDetailsModel(footballDbConnection);
                const FbPlayersSchema = createFbPlayersModel(footballDbConnection);

                //params.userid = req.user.id
                // let playerteam = await userteamsfb.create(params);

                // let uteamid = playerteam._id
                // params.uteamid = uteamid
                // params.pid = pid

                let array = params.pid
                let uniqueArray = Array.from(new Set(array));
                let lengthPlayers = uniqueArray.length;


                if (lengthPlayers == settingDetail.substitutePlyCount) {
                    let oldpalyerdata = await UserPlayersFbSchema.distinct("pid", { league_id: params.league_id })

                    let newPlyList = params.pid.sort()
                    // newdata = newdata.sort()
                    let checkPlyDup = oldpalyerdata.every((v, i) => v === newPlyList);
                    console.log("params-->>",params)
                    let fbPlayerList = await FbPlayersSchema.aggregate([
                        {"$match":{ "league_id": params.league_id, "pid": { "$in": params.pid },tid:{"$ne":null} }},
                        {
                            "$group":
                            {
                                _id: "$pid", "pid": { $first: "$pid" }, "tid": { $first: "$tid" }
                            }
                        },
                        {
                            "$lookup":
                            {
                                from: "fb_player_details",
                                localField: "pid",
                                foreignField: "pid",
                                as: "player_details",
                            },
                        },
                        {
                            "$unwind": {
                                "path": "$player_details",
                                "preserveNullAndEmptyArrays": true
                            }
                        },
                        {
                            "$project":{
                            "pid": 1, "position_id": "$player_details.position_id", "tid": 1
                        }}]);
                        ////

                    let SendPlayerData = {};
                    let team_players = await fbPlayerList && fbPlayerList.map((item3, i) => {
                        SendPlayerData[item3.pid] = {
                            playing_role: item3?.position_id,
                            team_id: item3?.tid,
                        }

                    })



                    if (!checkPlyDup) {
                        if (params.uteamid) {
                            await UserPlayersFbSchema.deleteMany({ league_id: params.league_id, uteamid: ObjectID(params.uteamid), is_substitue: 1 });
                        }

                        for (let i = 0; i < params.pid.length; i++) {

                            let createData = {
                                pid: params.pid[i],
                                league_id: params.league_id,
                                uteamid: params.uteamid,
                                is_substitue: params.is_substitue,
                                team_count: params.team_count,
                                team_no: params.team_no,
                                userid: params.userid,
                                playing_role: SendPlayerData[params.pid[i]]["playing_role"],
                                mteam_id: SendPlayerData[params.pid[i]]["team_id"]
                            }
                            await UserPlayersFbSchema.create(createData);
                        }
                    }

                    return res.send(response({ uteamid: params.uteamid }, "Add Football Player Successfully!.", true));


                } else {
                    return res.send(response({}, "List of player should be " + settingDetail.substitutePlyCount + ".", false));
                }
            }
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },

    sereis_player_list: async (req, res, next) => {
        try {
            const params = req.body;
            const user = req.user;
            let page = parseInt(req.query.page || 1)
            let limit = parseInt(req.query.limit || 10);
            let startIndex = (page - 1) * limit;
            let endIndex = page * limit;
            params.league_id = parseInt(params.league_id);

            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const ContestSeriesSchema=createContestSeriesModel(vendorDbConnection);

            if (params.type == "Cricket") {
                const cktDbConnection = await connectWithCricketDb();
                const CktTeamsSchema = createCktTeamsModel(cktDbConnection);
                const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);
                const CktSeriesMetaDataSchema = createCktSeriesMetaDataModel(cktDbConnection);
                const CktPlayersSchema = createCktPlayersModel(cktDbConnection);
                const UpcomingCricketSchema=createUpcomingCricketModel(cktDbConnection);
                
                let player_list = [];
                //limit and pagination 
                let cktleag_name = await CktLeaguesSchema.findOne({ "cid": params.league_id })

                let series_name = cktleag_name?.name
                let series_date_start = cktleag_name?.date_start
                let checkhttpurl = cktleag_name && cktleag_name.logo_url && isValidHttpUrl(cktleag_name.logo_url)
                if (checkhttpurl) {
                    cktleag_name.logo_url = cktleag_name.logo_url
                } else {
                    cktleag_name.logo_url = (cktleag_name && cktleag_name.logo_url) ? (`${env.awsimgurl}profile_doc/${cktleag_name.logo_url}`) : ""
                }

                let series_logo = cktleag_name.logo_url
                let itemLogo = await CktSeriesMetaDataSchema.findOne({ league_id: params.league_id });
                if (itemLogo) {
                    series_logo = `${env.awsimgurl}profile_doc/${itemLogo.logo_url}`

                }

                
                let teamList = await CktTeamsSchema.find({
                    "cid": params.league_id
                }, { "team_id": 1, "team": 1 })
                let teamObj = {};
                let teamIds = [];
                teamList.forEach((itemTm) => {
                    teamObj[itemTm.team_id] = itemTm;
                    teamIds.push(itemTm.team_id);
                })

                let condPlayer={ "league_id": params.league_id };
                if(params?.contest_id){
                    let contestMatchList=await ContestSeriesSchema.findOne({"contest_id":ObjectId(params.contest_id)});
                    let UpcomingCricketList=await UpcomingCricketSchema.distinct("match_id",{"date_start_ist":{"$gte":contestMatchList.date_start,"$lte":contestMatchList.date_end}});
                    condPlayer["match_id"]={"$in":UpcomingCricketList};
                }
                let playerList = await CktPlayersSchema.aggregate(
                    [
                        { "$match": condPlayer },
                        {
                            
                                "$group": {
                                    "_id": { pid: "$pid"},"pid":{"$first":"$pid"},"tid":{"$first":"$tid"},"is_playing":{"$first":"$is_playing"} ,
                                }
                            
                        },
                        {
                            $lookup:
                            {
                                from: "ckt_player_meta_data",
                                localField: "pid",
                                foreignField: "pid",
                                as: "player_meta",
                            },
                        },
                        {
                            $unwind: {
                                "path": "$player_meta",
                                "preserveNullAndEmptyArrays": true
                            }
                        },
                        {
                            $lookup:
                            {
                                from: "ckt_player_details",
                                localField: "pid",
                                foreignField: "pid",
                                as: "player_detail",
                            },
                        },
                        {
                            $unwind: {
                                "path": "$player_detail",
                                "preserveNullAndEmptyArrays": true
                            }
                        },
                        {
                            "$project": {
                                "pid": 1 , "first_name": "$player_detail.first_name" 
                                , "tid": 1 , "fantasy_player_rating": "$player_detail.fantasy_player_rating" , "bowling_style": "$player_detail.bowling_style" 
                                , "batting_style": "$player_detail.batting_style" , "playing_role": "$player_detail.playing_role" , "is_playing": 1 , 
                                  "logo_url": "$player_meta.logo_url" , "jersy_no": "$player_meta.jersy_no" 

                            }
                        }
                    ]);


                let otherLegPly = 0;
                if (playerList && playerList.length > 0) {
                    playerList.forEach((itemPly) => {
                        // let checkhttpurl = isValidHttpUrl(fbleague_name.logo_path)
                        // if (checkhttpurl) {
                        //     fbleague_name.logo_path = fbleague_name.logo_path
                        // } else {
                        //     fbleague_name.logo_path = `${env.awsimgurl}profile_doc/${fbleague_name.logo_path}`
                        // }


                        player_list.push({
                            team_id: itemPly.tid,
                            team_name: teamObj[itemPly.tid]["team"]["title"],
                            team_short_name: teamObj[itemPly.tid]["team"]["abbr"],
                            player_id: itemPly.pid,
                            // player_name: item2?.name,
                            player_name: itemPly.first_name,
                            rating: itemPly.fantasy_player_rating,
                            bowling_style: itemPly.bowling_style,
                            batting_style: itemPly.batting_style,
                            playing_role: itemPly.playing_role,
                            is_playing: itemPly.is_playing,
                            avg_point: "",
                            player_image: (itemPly.logo_url) ? `${env.awsimgurl}profile_doc/${itemPly.logo_url}` : "",
                            jersy_no: (itemPly && itemPly.jersy_no)
                        })
                    })
                } else {


                    let plyOfOtherLegList = await CktPlayersSchema.aggregate(
                        [
                            { "$match": { tid: { "$in": teamIds } } },
                            {
                            
                                    "$group": {
                                        "_id": { pid: "$pid"},"pid":{"$first":"$pid"},"tid":{"$first":"$tid"},"is_playing":{"$first":"$is_playing"} ,
                                    }
                                
                            },
                            {
                                $lookup:
                                {
                                    from: "ckt_player_meta_data",
                                    localField: "pid",
                                    foreignField: "pid",
                                    as: "player_meta",
                                },
                            },
                            {
                                $unwind: {
                                    "path": "$player_meta",
                                    "preserveNullAndEmptyArrays": true
                                }
                            },
                            {
                                $lookup:
                                {
                                    from: "ckt_player_details",
                                    localField: "pid",
                                    foreignField: "pid",
                                    as: "player_detail",
                                },
                            },
                            {
                                $unwind: {
                                    "path": "$player_detail",
                                    "preserveNullAndEmptyArrays": true
                                }
                            },
                            {
                                "$group": {
                                    "_id": { pid: "$pid" }, "pid": { "$first": "$pid" }, "first_name": { "$first": "$player_detail.first_name" }
                                    , "tid": { "$first": "$tid" }, "fantasy_player_rating": { "$first": "$player_detail.fantasy_player_rating" }, "bowling_style": { "$first": "$player_detail.bowling_style" }
                                    , "batting_style": { "$first": "$player_detail.batting_style" }, "playing_role": { "$first": "$player_detail.playing_role" }, "is_playing": { "$first": "$is_playing" }, 
                                    "pid": { "$first": "$pid" }, "logo_url": { "$first": "$player_meta.logo_url" }, "jersy_no": { "$first": "$player_meta.jersy_no" }

                                }
                            }
                        ]);
                    if (plyOfOtherLegList && plyOfOtherLegList.length > 0) {

                        otherLegPly = "!";
                        plyOfOtherLegList.forEach((itemPly) => {
                            player_list.push({
                                team_id: itemPly.tid,
                                team_name: teamObj[itemPly.tid]["team"]["title"],
                                team_short_name: teamObj[itemPly.tid]["team"]["abbr"],
                                player_id: itemPly.pid,
                                // player_name: item2?.name,
                                player_name: itemPly.first_name,
                                rating: itemPly.fantasy_player_rating,
                                bowling_style: itemPly.bowling_style,
                                batting_style: itemPly.batting_style,
                                playing_role: itemPly.playing_role,
                                is_playing: 2,
                                avg_point: "",
                                player_image: (itemPly.logo_url) ? `${env.awsimgurl}profile_doc/${itemPly.logo_url}` : "",
                                jersy_no: (itemPly && itemPly.jersy_no)
                            })
                        })

                    }



                }

                let total_count = await CktTeamsSchema.countDocuments({ "cid": params.league_id })

                return res.send(response({
                    // playerdetail,
                    series_name,
                    series_logo,
                    series_date_start,
                    player_list,
                    // playerdetail,
                    total_count: total_count
                },
                    player_list.length > 0 ? "Cricket Player list view succesfully.!" + otherLegPly : "No data found.!!!", true
                ))

            }

            if (params.type == "Football") {
                const footballDbConnection = await connectWithFootballDb();
                const FbPlayersSchema = createFbPlayersModel(footballDbConnection);
                const FbPlayerDetailsSchema = createFbPlayerDetailsModel(footballDbConnection);
                const FbLeaguesSchema = createFbLeaguesModel(footballDbConnection);
                const FbTeamsSchema = createFbTeamsModel(footballDbConnection);
                const FbLeaguesSeasonsSchema=createFbLeaguesSeasonsModel(footballDbConnection);
                const FbUpcomingsSchema=createFbUpcomingsModel(footballDbConnection);

                let fbleague_name = await FbLeaguesSeasonsSchema.aggregate([{ "$match": { "season_id": params.league_id } },
                    {
                        "$lookup":
                        {
                            from: "fb_league_details",
                            localField: "league_id",
                            foreignField: "id",
                            as: "leaguedetail",
                        },  
                    },
                    { 
                        "$unwind": { 
                            "path": "$leaguedetail", 
                            "preserveNullAndEmptyArrays": true 
                        }
                    },
                    { "$project": { "name": "$leaguedetail.name", "date_start": 1, "logo_path": "$leaguedetail.logo_path" } }]);
                //({ "season_id": params.league_id })
                console.log("fbleague_name--->>",fbleague_name);

                let series_name = fbleague_name?.name
                let series_date_start = fbleague_name?.date_start
                //let checkhttpurl = isValidHttpUrl(fbleague_name?.logo_path)
                //if (checkhttpurl) {
                    fbleague_name.logo_path = fbleague_name.logo_path
                // } else {
                //     fbleague_name.logo_path = `${env.awsimgurl}profile_doc/${fbleague_name?.logo_path}`
                // }
                let series_logo = fbleague_name.logo_path;

                console.log("params-->>", params);
                
                let condPlayer={ "season_id": params.league_id };
                if(params?.contest_id){
                    let contestMatchList=await ContestSeriesSchema.findOne({"contest_id":ObjectId(params.contest_id)});
                    let UpcomingFBList=await FbUpcomingsSchema.distinct("match_id",{"date_start_ist":{"$gte":contestMatchList.date_start,"$lte":contestMatchList.date_end}});
                    condPlayer["match_id"]={"$in":UpcomingFBList};
                }

                console.log("condPlayer--->>",)

                let player_deatail = await FbPlayersSchema.aggregate([{ "$match": condPlayer },
                    {
                        "$group":{_id:{"pid":"$pid"},"pid":{"$first":"$pid"},"tid":{"$first":"$tid"},"is_playing":{"$first":"$is_playing"},"avg_point":{"$first":"$avg_point"}}
                    },
                    {
                        $lookup:
                        {
                            from: "fb_player_details",
                            localField: "pid",
                            foreignField: "pid",
                            as: "player_detail",
                        },
                    },
                    {
                        $unwind: {
                            "path": "$player_detail",
                            "preserveNullAndEmptyArrays": true
                        }
                    },
                    {
                    $lookup:
                    {
                        from: "fb_players_meta_data",
                        localField: "pid",
                        foreignField: "pid",
                        as: "player_meta",
                    },
                },
                {
                    $unwind: {
                        "path": "$player_meta",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $lookup:
                    {
                        from: "fb_teams",
                        localField: "tid",
                        foreignField: "team_id",
                        as: "team_detail",
                    },
                },
                {
                    $unwind: {
                        "path": "$team_detail",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$project":
                    {
                        // "pid": 1, "position_id": "$player_detail.position_id", "tid": 1,
                        // "fullname": "$player_detail.fullname", "image_path": "$player_detail.image_path" , "logo_url": "$player_meta.logo_url", "jersy_no": "$player_detail.jersey_number"

                        team_id:"$tid",
                        team_name:"$team_detail.name",
                        team_short_name:"$team_detail.short_code",
                        team_logo_url:"$team_detail.logo_path",
                        player_id:"$pid",
                        player_name:"$player_detail.fullname",
                        //rating
                        playing_role:"$player_detail.position_id",
                        is_playing:"$is_playing",
                        avg_point:"$avg_point",
                        player_image:"$player_detail.image_path",
                        jersy_no:"$player_detail.jersey_number"
                    }
                }
                ])
                
                // let teamObj = {};
                // let teamDetail = await FbTeamsSchema.find({
                //     "season_id"
                //         : params.league_id
                // }, { "team_id": 1, "name": 1, "short_code": 1, "logo_path": 1 })
                // teamDetail.forEach(itemTm => {
                //     teamObj[itemTm.team_id] = itemTm;
                // })
                //console.log("player_deatail--->>",player_deatail)



                let player_list = [];
                let no_Team_Ply_list = {};
                // player_deatail && player_deatail.map(async (itemPly) => {

                //     // if (teamObj && teamObj[itemPly.tid]) {
                //         player_list.push({
                //             team_id: teamObj[itemPly.tid]["team_id"],
                //             team_name: teamObj[itemPly.tid]["name"],
                //             team_short_name: teamObj[itemPly.tid]["short_code"],
                //             team_logo_url: teamObj[itemPly.tid]["logo_path"],
                //             player_id: itemPly.pid,
                //             player_name: itemPly.fullname,
                //             rating: "", //itemPly.rating,
                //             playing_role: itemPly.position_id,
                //             // is_playing: item.is_playing,
                //             avg_point: "",
                //             player_image: itemPly.image_path,
                //             jersy_no: (itemPly && itemPly.jersy_no)
                //         })
                    // } else {
                    //     no_Team_Ply_list[itemPly.tid] = 1;
                    // }

                    //}
                    //})


                    //         let playerdeatails = itemTeams.teamb.squad.data.map((item, i) => {

                    //             if (item.player && item.player.data && item.player.data.team_id) {
                    //                 player_list.push({
                    //                     team_id: item.player.data.team_id,
                    //                     team_name: player_deatail.teamb?.team.title,
                    //                     team_short_name: player_deatail.teamb?.team.abbr,
                    //                     team_logo_url: player_deatail.teamb?.team.logo_url,
                    //                     player_id: item.player_id,
                    //                     // player_name: item2?.name,
                    //                     player_name: item.player.data.fullname,
                    //                     rating: item.rating,
                    //                     playing_role: item.position_id,
                    //                     is_playing: item.is_playing,
                    //                     avg_point: "",
                    //                     player_image: item.player.data.image_path,
                    //                 })
                    //             }
                    //         })
                //)

                let total_count = await FbTeamsSchema.countDocuments({ "season_id": params.league_id })

                return res.send(response({
                    // player_deatail,
                    series_name,
                    series_logo,
                    series_date_start,
                    player_list:player_deatail,
                    // player_deatail,
                    total_count: total_count
                },
                    player_deatail.length > 0 ? "Football Player list view succesfully.!!!" : "No data found.!!!", true
                ))
            }

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    // team_list_user: async (req, res, next) => {
    //     try {
    //         const params = req.body


    //         let team_list = await userteamckt.aggregate([
    //             {
    //                 $match: { "match_id": params.match_id, userid: req.user.id }
    //             },
    //             {
    //                 $lookup:
    //                 {
    //                     from: "userplymckts",
    //                     localField: "_id",
    //                     foreignField: "uteamid",
    //                     as: "playerlist"
    //                 }
    //             },
    //         ])


    //         return res.send(response(team_list, "Team list find Successfully!.", true));
    //     } catch (error) {
    //         next(error)
    //     }
    // }
    team_list_user: async (req, res, next) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const JoinMatchContestsSchema = createJoinMatchContestsModel(vendorDbConnection);
            
            const params = req.body;
            params.poolid = (params.poolid) ? params.poolid : "";
            
            params.userid = ObjectId(req.user.id);
            params.match_id=parseInt(params.match_id);

            let UpcomingSchema=null;
            let UserTeamSchema=null;
            if(params.type=="cricket"){
                const cktDbConnection = await connectWithCricketDb();
                const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);
                const UserTeamCktSchema = createUserTeamCktModel(vendorDbConnection);
                UpcomingSchema= UpcomingCricketsSchema;
                UserTeamSchema=UserTeamCktSchema;
                console.log("params.type-cricket");
            }else{
                const footballDbConnection = await connectWithFootballDb();
                const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);
                const UserTeamFbSchema=createUserTeamFbModel(vendorDbConnection)
                UpcomingSchema= FbUpcomingsSchema;
                UserTeamSchema=UserTeamFbSchema;
                console.log("params.type-football");
            }
            
            let upcomingData=await UpcomingSchema.findOne({"match_id": params.match_id});

            let teamListData=await UserTeamSchema.find({"match_id": params.match_id, "userid": params.userid});
            console.log("teamListData-->>",dbName,{type:params,"match_id": params.match_id, "userid": params.userid},teamListData)
            
            let teamObj={};
            for(let i=0;i<teamListData.length;i++){
                let allType={};
                let objUserTeam=teamListData[i];
                
                let playerRoleCount=objUserTeam?.["player_role_count"];
                allType={...allType,...playerRoleCount}

                allType["uteamid"] = objUserTeam._id;
                allType["teama"] = upcomingData.teama.name;
                allType["teamb"] = upcomingData.teamb.name;
                allType["logo_url_teama"] = upcomingData.teama.logo_url;
                allType["logo_url_teamb"] = upcomingData.teamb.logo_url;
                allType["teama_count"] = objUserTeam?.team_count?.[upcomingData.teama.team_id]||0;
                allType["teamb_count"] = objUserTeam?.team_count?.[upcomingData.teamb.team_id]||0;
                allType["team_no"] = objUserTeam.team_no;
                teamObj[objUserTeam._id]=allType;
            }
            

            let myUsrTeam = await UserTeamSchema.countDocuments({
                match_id: params.match_id,
                userid: params.userid
            })

            let joinContestCount = await JoinMatchContestsSchema.countDocuments({
                match_id: params.match_id,
                userid: params.userid
            })
            let joinedTeamInPool = null;
            if (params.poolid) {
                joinedTeamInPool = await JoinMatchContestsSchema.distinct("uteamid", { match_id: params.match_id, userid: params.userid, "poolid": ObjectId(params.poolid) })
            }

            teamObj = (teamObj) ? Object.values(teamObj) : [];
            
            return res.send({ status: true, data: teamObj, mypicks: myUsrTeam, contestCount: joinContestCount, joinedTeamInPool, message: teamObj.length > 0 ? "Your team list" : "You have not created any team of players" });
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    team_list_user_fb: async (req, res, next) => {
        try {
            const footballDbConnection = await connectWithFootballDb();
            const FbPlayersSchema = createFbPlayersModel(footballDbConnection);

            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const JoinMatchContestsSchema = createJoinMatchContestsModel(vendorDbConnection);
            const UserPlayerMatchFbsSchema = createUserPlayerMatchFbsModel(vendorDbConnection);
            const UserTeamFbSchema = createUserTeamFbModel(vendorDbConnection);

            const params = req.body
            params.userid = req.user.id;
            params.poolid = (params.poolid) ? params.poolid : "";

            //Todo: Not using
            
            const Fbplayer = await FbPlayersSchema.findOne({ match_id: params.match_id })//Todo: Not using

            let joinContestFind = await UserPlayerMatchFbsSchema.aggregate([
                {
                    "$match": { "match_id": params.match_id }
                },

                {
                    $lookup:
                    {
                        from: "fbplayerdetails",
                        localField: "pid",
                        foreignField: "pid",
                        as: "playerdata",

                    }
                },
                {
                    $unwind: {
                        "path": "$playerdata",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $group: {
                        _id: { "uteamid": "$uteamid" },
                        "uteamid": { "$first": "$uteamid" },
                        "team_no": { "$first": "$team_no" },
                        "teama_count": { "$first": "$teama_count" },
                        "teamb_count": { "$first": "$teamb_count" },
                        "GK": { "$sum": { $cond: { if: { $eq: ["$playerdata.position_id", 1] }, then: 1, else: 0 } } },
                        "DEF": { "$sum": { $cond: { if: { $eq: ["$playerdata.position_id", 2] }, then: 1, else: 0 } } },
                        "MID": { "$sum": { $cond: { if: { $eq: ["$playerdata.position_id", 3] }, then: 1, else: 0 } } },
                        "FWD": { "$sum": { $cond: { if: { $eq: ["$playerdata.position_id", 4] }, then: 1, else: 0 } } }
                    }
                },
            ]);

            let teamObj = {};
            let players_id = []

            joinContestFind.forEach((item) => {
                item["teama"] = footballQuery?.teama?.name;
                item["teamb"] = footballQuery?.teamb?.name;
                item["logo_url_teama"] = footballQuery?.teama.logo_url;
                item["logo_url_teamb"] = footballQuery?.teamb?.logo_url;
                teamObj[item.uteamid] = item;
            });

            let myUsrTeam = await UserTeamFbSchema.countDocuments({
                match_id: params.match_id,
                userid: params.userid
            })

            let joinContestCount = await JoinMatchContestsSchema.countDocuments({
                match_id: params.match_id,
                userid: params.userid
                // uteamid: item.uteamid
            })


            let joinedTeamInPool = null;
            if (params.poolid) {
                joinedTeamInPool = await JoinMatchContestsSchema.distinct("uteamid", { match_id: params.match_id, userid: params.userid, "poolid": ObjectId(params.poolid) })
            }

            // teamObj = (teamObj) ? Object.values(teamObj) : [];

            // return res.send(response(teamObj, teamObj.length > 0 ? "Your team list" : "You have not created any team of players", (teamObj.length > 0) ? true : false));
            teamObj = (teamObj) ? Object.values(teamObj) : [];
            // return res.send(response(teamObj, teamObj.length > 0 ? "Your team list" : "You have not created any team of players", true));

            return res.send({ status: true, data: teamObj, mypicks: myUsrTeam, contestCount: joinContestCount, joinedTeamInPool, message: teamObj.length > 0 ? "Your team list" : "You have not created any team of players" });
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },



    team_series_list_ckt: async (req, res, next) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const CktTeamsSchema = createCktTeamsModel(cktDbConnection);
            const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);
            const CktSeriesMetaDataSchema = createCktSeriesMetaDataModel(cktDbConnection);

            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const JoinContestsSchema = createSeriesJoinContestsModel(vendorDbConnection);
            const UserPlayersCktSchema = createUserPlayersCktModel(vendorDbConnection);
            const UserCktSeriesTeamSchema = createUserCktSeriesTeamModel(vendorDbConnection);
            const ContestSeriesSchema=createContestSeriesModel(vendorDbConnection);

            const params = req.body;
            params.userid = ObjectId(req.user.id);
            params.poolid = (params.poolid) ? params.poolid : "";
            let teamObj = {};
            let cktLDetail = await CktLeaguesSchema.findOne({ "cid": params.league_id });

            let leagueImage = await CktSeriesMetaDataSchema.findOne({ league_id: params.league_id });

            //let cktPlayer = await cricketsplayers.findOne({ "teama.cid": params.league_id })

            let cktplayers = await CktTeamsSchema.find({ cid: params.league_id })
            
            
            let newteam = {}

            cktplayers.map(async (item2, i) => {
                let player_count = []
                newteam[item2.team.tid] = {
                    "team_short_name": item2.team.abbr,
                    "team_name": item2.team.title,
                    "logo_url": item2.team.logo_url,
                    "tid": item2.team.tid,
                    "team_no": 0
                }

                console.log("params--->>",params)
                let userteamSCktList = await UserCktSeriesTeamSchema.find({ "userid": ObjectId(params.userid), "league_id": params.league_id,"contest_id":ObjectId(params.contest_id) });
                

                userteamSCktList.forEach(async (itemUserteam) => {
                    let usrPlayer = await UserPlayersCktSchema.aggregate([
                        {
                            "$match": { userid: ObjectId(params.userid), "league_id": params.league_id, "uteamid": ObjectID(itemUserteam._id) }
                        },

                        {
                            "$group": { "_id": { "playing_role": "$playing_role", "uteamid": "$uteamid" }, "playing_role": { "$first": "$playing_role" }, "league_id": { "$first": "$league_id" }, "uteamid": { "$first": "$uteamid" }, "team_count": { "$first": "$team_count" }, "team_no": { "$first": "$team_no" }, "rolecnt": { "$sum": 1 } }
                        }

                    ])
                    

                    let allType = { "bat": 0, "bowl": 0, "wk": 0, "all": 0 }
                    usrPlayer.forEach(async (item) => {
                        if (item.playing_role == "bat") {
                            allType["bat"] = item.rolecnt;
                        }
                        if (item.playing_role == "bowl") {
                            allType["bowl"] = item.rolecnt;
                        }
                        if (item.playing_role == "wk") {
                            allType["wk"] = item.rolecnt;
                        }
                        if (item.playing_role == "all") {
                            allType["all"] = item.rolecnt;
                        }
                        // allType["DEF"] = (item.position_id == 2) && item.rolecnt ;
                        // allType["MID"] = (item.position_id == 3) && item.rolecnt ;
                        // allType["FWD"] = (item.position_id == 4) && item.rolecnt ;

                        allType["team_no"] = item.team_no;
                        allType["team"] = cktLDetail.name;
                        allType["logo_url_team"] = (leagueImage && leagueImage.logo_url) ? `${env.awsimgurl}profile_doc/${leagueImage.logo_url}` : cktLDetail.logo_path; //cktLDetail.logo_path;
                        allType["uteamid"] = item.uteamid;

                        let teamList = [];

                        item.team_count && Object.keys(item.team_count).length > 0 && Object.keys(item.team_count).map((itemId) => {

                            let finalTeamDetail = {};
                            finalTeamDetail = (newteam[itemId]) ? newteam[itemId] : {};

                            finalTeamDetail["team_no"] = (item.team_count && item.team_count[itemId]) ? item.team_count[itemId] : 0;
                            teamList.push(finalTeamDetail)
                        })


                        allType["team_count"] = teamList;

                        teamObj[item.uteamid] = allType;
                    })
                })
            })

            let myUsrTeam = await UserCktSeriesTeamSchema.countDocuments({
                league_id: params.league_id,
                userid: ObjectId(params.userid)
            })

            let joinContestCount = await JoinContestsSchema.countDocuments({
                league_id: params.league_id,
                userid: ObjectId(params.userid)
            })
            let joinedTeamInPool = null;
            if (params.poolid) {
                joinedTeamInPool = await JoinContestsSchema.distinct("uteamid", { league_id: params.league_id, userid: params.userid, "poolid": ObjectId(params.poolid) })
            }

            let cktname = await CktLeaguesSchema.findOne({ cid: params.league_id })

            let checkhttpurl =cktname?.logo_url ? isValidHttpUrl(cktname.logo_url):false;
            if (checkhttpurl) {
                cktname.logo_url = cktname.logo_url
            } else {
                cktname.logo_url = `${env.awsimgurl}profile_doc/${cktname.logo_url}`
            }
            let series_logo_url = cktname.logo_url

            let itemLogo = await CktSeriesMetaDataSchema.findOne({ league_id: params.league_id });
            letSendTeamData = {
                title: cktname.name,
                logo_url: (itemLogo && itemLogo.logo_url) ? `${env.awsimgurl}profile_doc/${itemLogo.logo_url}` : series_logo_url,

            }


            teamObj = (teamObj) ? Object.values(teamObj) : [];
            

            return res.send({ status: true, data: teamObj, mypicks: myUsrTeam, contestCount: joinContestCount, joinedTeamInPool, matchDetail: letSendTeamData, message: teamObj.length > 0 ? "Your team list" : "You have not created any team of players" });


        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    team_series_list_user_fb: async (req, res, next) => {
        try {
            const footballDbConnection = await connectWithFootballDb();
            const FbPlayerDetailsSchema = createFbPlayerDetailsModel(footballDbConnection);
            const FbLeaguesSchema = createFbLeaguesModel(footballDbConnection);
            const FbTeamsSchema = createFbTeamsModel(footballDbConnection);
            const FbLeaguesSeasonsSchema=createFbLeaguesSeasonsModel(footballDbConnection);
            const FbLeagueDetailsSchema=createFbLeagueDetailsModel(footballDbConnection);
            

            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const JoinContestsSchema = createSeriesJoinContestsModel(vendorDbConnection);
            const UserPlayersFbSchema = createUserPlayersFbModel(vendorDbConnection);
            const UserFbLeagueSchema = createUserFbLeagueModel(vendorDbConnection);

            const params = req.body
            params.userid = ObjectId(req.user.id)
            params.poolid = (params.poolid) ? params.poolid : "";
            let teamObj = {};

            console.log("params.league_id--->>", params.league_id);
            let footLDetail = await FbLeaguesSeasonsSchema.findOne({ "season_id": params.league_id });
            let leagueDetails=await FbLeagueDetailsSchema.findOne({"id":footLDetail.league_id});
            // //Todo: Not using
            // let fbPlayerList = await FbPlayerDetailsSchema.aggregate([{ "$match": { "season_id": params.league_id } },
            // {
            //     "$group":
            //     {
            //         _id: "$pid", "pid": { $first: "$pid" }, "position_id": { $first: "$position_id" }, "tid": { $first: "$tid" }
            //     }
            // }
            // ])


            // let cktPlayer = await cricketsplayers.findOne({ "teama.cid": params.league_id })

            //let newfbplayer = await fbteams.findOne({ "season_id": params.league_id })
            let fbTeamList = await FbTeamsSchema.find({ "season_id": params.league_id }, {
                short_code: 1,
                name: 1,
                logo_path: 1,
                team_id: 1
            })


            let newteam = {}

            fbTeamList.map(async (item2, i) => {
                let player_count = []
                newteam[item2.team_id] = {
                    "team_short_name": item2.short_code,
                    "team_name": item2.name,
                    "logo_url": item2.logo_path,
                    "tid": item2.team_id,
                    "team_no": 0
                }
            })

            let userteamSfbList = await UserFbLeagueSchema.find({ "userid": params.userid, "league_id": params.league_id });

            userteamSfbList.forEach(async (itemUserteam) => {
                let allType = { "GK": 0, "DEF": 0, "MID": 0, "FWD": 0 };
                let team_no = 0;
                let usrPlayer = await UserPlayersFbSchema.aggregate([
                    {
                        "$match": { userid: params.userid, "league_id": params.league_id, "uteamid": ObjectID(itemUserteam._id) }
                    },

                    {
                        "$group": { "_id": { "playing_role": "$playing_role", "uteamid": "$uteamid" }, "playing_role": { "$first": "$playing_role" }, "league_id": { "$first": "$league_id" }, "uteamid": { "$first": "$uteamid" }, "team_count": { "$first": "$team_count" }, "team_no": { "$first": "$team_no" }, "rolecnt": { "$sum": 1 } }
                    }

                ]
                )
                usrPlayer.forEach(async (item) => {
                    if (item.playing_role == 1) {
                        allType["GK"] = item.rolecnt;
                    }
                    if (item.playing_role == 2) {
                        allType["DEF"] = item.rolecnt;
                    }
                    if (item.playing_role == 3) {
                        allType["MID"] = item.rolecnt;
                    }
                    if (item.playing_role == 4) {
                        allType["FWD"] = item.rolecnt;
                    }
                    // allType["DEF"] = (item.position_id == 2) && item.rolecnt ;
                    // allType["MID"] = (item.position_id == 3) && item.rolecnt ;
                    // allType["FWD"] = (item.position_id == 4) && item.rolecnt ;

                    allType["team_no"] = item.team_no;
                    allType["team"] = leagueDetails.name;
                    allType["logo_url_team"] = leagueDetails.logo_path;
                    allType["uteamid"] = item.uteamid;

                    let teamList = [];

                    item.team_count && Object.keys(item.team_count).length > 0 && Object.keys(item.team_count).map((itemId) => {

                        let finalTeamDetail = {};
                        finalTeamDetail = (newteam[itemId]) ? newteam[itemId] : {};

                        finalTeamDetail["team_no"] = (item.team_count && item.team_count[itemId]) ? item.team_count[itemId] : 0;
                        teamList.push(finalTeamDetail)
                    })


                    allType["team_count"] = teamList;

                    teamObj[item.uteamid] = allType;

                    //}
                })
            })



            let myUsrTeam = await UserFbLeagueSchema.countDocuments({
                league_id: params.league_id,
                userid: params.userid
            })

            let joinContestCount = await JoinContestsSchema.countDocuments({
                league_id: params.league_id,
                userid: params.userid
            })

            let joinedTeamInPool = null;
            if (params.poolid) {
                joinedTeamInPool = await JoinContestsSchema.distinct("uteamid", { league_id: params.league_id, userid: params.userid, "poolid": ObjectId(params.poolid) })
            }
            let fbname = await FbLeaguesSeasonsSchema.aggregate([{"$match":{ season_id: params.league_id }},
                {
                    $lookup:
                    {
                        from: "fb_league_details",
                        localField: "id",
                        foreignField: "id",
                        as: "league_details"
                    },

                },
                {
                        $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
                },
            ])

            fbname=fbname?.[0];
            let checkhttpurl = isValidHttpUrl(fbname?.league_details?.logo_path)
            if (checkhttpurl) {
                fbname.logo_path = fbname?.league_details?.logo_path
            } else {
                fbname.logo_path = `${env.awsimgurl}profile_doc/${fbname?.league_details?.logo_path}`
            }
            let series_logo_url = fbname?.league_details?.logo_path

            letSendTeamData = {
                title: fbname?.league_details?.short_code,
                logo_url: series_logo_url,
            }

            teamObj = (teamObj) ? Object.values(teamObj) : [];

            return res.send({ status: true, data: teamObj, mypicks: myUsrTeam, contestCount: joinContestCount, joinedTeamInPool, matchDetail: letSendTeamData, message: teamObj.length > 0 ? "Your team list" : "You have not created any team of players" });

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },

    clone_match_player_list: async (req, res, next) => {
        try {
            const params = req.body;
            params.userid = req.user.id

            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UserPlayerMatchCktsSchema = createUserPlayerMatchCktsModel(vendorDbConnection);
            const UserTeamCktSchema = createUserTeamCktModel(vendorDbConnection);

            let find_player = await UserPlayerMatchCktsSchema.find({ uteamid: params.uteamid })

            params.match_id = find_player[0].match_id

            let new_playerteam = await UserTeamCktSchema.create(params);


            let uteamid = new_playerteam._id
            params.uteamid = uteamid

            await Promise.all(find_player.map(async function (item) {
                let createData = {
                    pid: item.pid,
                    match_id: params.match_id,
                    uteamid: uteamid,
                    userid: req.user.id,
                    teama_count: item.teama_count,
                    teamb_count: item.teamb_count,
                    team_no: params.team_no
                }

                await UserPlayerMatchCktsSchema.create(createData);
                let liveEmitData = {
                    "match_id": params.match_id, "type": "m", "fetch_latest": 1, "authorization": req.headers.authorization,"auth":1,
                    "userid":req.user.id,"cronapikey":req.user.apikey
                }
                let sktUrl = (params.type == "cricket") ? "my_match_cricket_pool_contest_list_v2" : "my_match_football_pool_contest_list_v2";
                console.log("sktUrl-addplayer_list-->>",sktUrl,liveEmitData);
                socketConnection()
                socket.emit(sktUrl, liveEmitData);
            }))
            return res.send(response({ uteamid: params.uteamid }, "Clone Match Player List Successfully!.", true));
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    clone_match_fb_player_list: async (req, res, next) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UserPlayerMatchFbsSchema = createUserPlayerMatchFbsModel(vendorDbConnection);
            const UserTeamFbSchema = createUserTeamFbModel(vendorDbConnection);

            const params = req.body;
            params.userid = req.user.id

            let find_player = await UserPlayerMatchFbsSchema.find({ uteamid: params.uteamid })

            params.match_id = find_player[0].match_id
            let new_playerteam = await UserTeamFbSchema.create(params);


            let uteamid = new_playerteam._id
            params.uteamid = uteamid

            await Promise.all(find_player.map(async function (item) {
                let createData = {
                    pid: item.pid,
                    match_id: params.match_id,
                    uteamid: uteamid,
                    userid: req.user.id,
                    teama_count: item.teama_count,
                    teamb_count: item.teamb_count,
                    team_no: params.team_no

                }
                await UserPlayerMatchFbsSchema.create(createData);
            }))


            return res.send(response({ uteamid: params.uteamid }, "Clone Match Player List Successfully!.", true));
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    clone_series_player_list: async (req, res, next) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UserPlayersCktSchema = createUserPlayersCktModel(vendorDbConnection);
            const UserCktSeriesTeamSchema = createUserCktSeriesTeamModel(vendorDbConnection);

            const params = req.body;
            params.userid = req.user.id;

            let find_player = await UserPlayersCktSchema.find({ uteamid: params.uteamid });

            params.league_id = find_player[0].league_id
            let new_playerteam = await UserCktSeriesTeamSchema.create(params);


            let uteamid = new_playerteam._id
            params.uteamid = uteamid

            await Promise.all(find_player.map(async function (item) {
                let createData = {
                    pid: item.pid,
                    league_id: params.league_id,
                    uteamid: uteamid,
                    userid: req.user.id
                }

                await UserPlayersCktSchema.create(createData);
            }))

            return res.send(response({ uteamid: params.uteamid }, "Clone Match Player List Successfully!.", true));
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    clone_series_fb_player_list: async (req, res, next) => {
        try {
            const params = req.body;
            params.userid = req.user.id

            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UserPlayersFbSchema = createUserPlayersFbModel(vendorDbConnection);
            const UserFbLeagueSchema = createUserFbLeagueModel(vendorDbConnection);

            let find_player = await UserPlayersFbSchema.find({ uteamid: params.uteamid })

            params.league_id = find_player[0].league_id
            let new_playerteam = await UserFbLeagueSchema.create(params);


            let uteamid = new_playerteam._id
            params.uteamid = uteamid

            await Promise.all(find_player.map(async function (item) {
                let createData = {
                    pid: item.pid,
                    league_id: params.league_id,
                    uteamid: uteamid,
                    userid: req.user.id,
                    team_count: item.team_count,
                    team_no: params.team_no
                }
                await UserPlayersFbSchema.create(createData);
            }))


            return res.send(response({ uteamid: params.uteamid }, "Clone Match Player List Successfully!.", true));
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    user_ckt_match_player_list: async (req, res, next) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UserPlayerMatchCktsSchema = createUserPlayerMatchCktsModel(vendorDbConnection);
            const UserPlayersCktSchema = createUserPlayersCktModel(vendorDbConnection);

            const params = req.body;
            let pid_array_list = [];
            let pid_array_list_sub = []
            let match_player_lists = null;
            if (params.smtype === "s") {
                match_player_lists = await UserPlayersCktSchema.find({ uteamid: ObjectID(params.uteamid) }, { pid: 1, is_substitue: 1 });
            } else {
                match_player_lists = await UserPlayerMatchCktsSchema.find({ uteamid: ObjectID(params.uteamid) }, { pid: 1 });
            }

            match_player_lists.map((item) => {
                if (item.is_substitue != 1) {
                    pid_array_list.push(item.pid)
                } else {
                    pid_array_list_sub.push(item.pid)
                }
            })

            let resData = {
                status: true,
                data: pid_array_list,
                data_sub: pid_array_list_sub,
                message: "User Match Player List Successfully!."
            }
            return res.send(resData);
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    user_fb_match_player_list: async (req, res, next) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UserPlayerMatchFbsSchema = createUserPlayerMatchFbsModel(vendorDbConnection);
            const UserPlayersFbSchema = createUserPlayersFbModel(vendorDbConnection);

            const params = req.body;
            let pid_array_list = []
            let match_player_lists = null;
            if (params.smtype === "s") {
                match_player_lists = await UserPlayersFbSchema.find({ uteamid: ObjectID(params.uteamid) }, { pid: 1 });
            } else {
                match_player_lists = await UserPlayerMatchFbsSchema.find({ uteamid: ObjectID(params.uteamid) }, { pid: 1 });
            }

            Promise.all(match_player_lists.filter((item) => pid_array_list.push(item.pid)))
            return res.send(response(pid_array_list, "User Match Player List Successfully!.", true));
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    edit_match_player_list: async (req, res, next) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);

            const params = req.body;
            if (params.type == "Cricket") {
                const cktDbConnection = await connectWithCricketDb();
                const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);
                const UserPlayerMatchCktsSchema = createUserPlayerMatchCktsModel(vendorDbConnection);
                const UserTeamCktSchema = createUserTeamCktModel(vendorDbConnection);
                
                let matchDetail = await UpcomingCricketsSchema.findOne({ "match_id": params.match_id });

                let currentDates = currentTimeZoneDate() * 1 / 1000;
                let matchDate = matchDetail?.date_start_ist * 1 / 1000;
                if (matchDate < currentDates) {
                    return res.send(response({}, "Match is live now. You cannot join", false))
                }

                ///////////////////////
                let oldpalyerdata = await UserPlayerMatchCktsSchema.aggregate([
                    {
                        $match: { match_id: params.match_id, userid: req.user.id }
                    },
                    {
                        $group: {
                            _id: { "uteamid": "$uteamid" }, "pid": { $push: "$pid" }
                        }
                    }
                ])

                
                let chkSimilarPlayersTeamCnt = 0;
                oldpalyerdata.forEach((oldItem) => {
                    let oldPlayerList = oldItem.pid;
                    let newPlyList = params.pid;
                    let isSimilarPlyTeam=areArraysEqual(oldPlayerList, newPlyList);
                    if(isSimilarPlyTeam==true){
                        chkSimilarPlayersTeamCnt++;
                    }
                })

                if (chkSimilarPlayersTeamCnt > 0) {
                    return res.send(response({}, " Player team already created!.", false));
                }else{
                ///////////////////////////
                        let match_player_lists = await UserPlayerMatchCktsSchema.find({ match_id: params.match_id, uteamid: params.uteamid, userid: req.user.id }).lean();

                        let pid = params.pid;
                        let v = []
                        match_player_lists = await Promise.all(match_player_lists.filter(function (item) {
                            for (let i = 0; i <= pid.length; i++) {
                                if (pid[i] == item.pid) { v.push(item.pid); return item }
                            }
                        }))

                        let match_player_list = match_player_lists;
                        await UserPlayerMatchCktsSchema.deleteMany({ match_id: params.match_id, uteamid: params.uteamid });
                        let newAddPlayerPID = await pid.filter(x => !v.includes(x));

                        

                        for (let i = 0; i < newAddPlayerPID.length; i++) {

                            match_player_list.push({
                                is_substitue: 0, pid: newAddPlayerPID[i],
                                match_id: params.match_id,
                                uteamid: params.uteamid,
                                userid: req.user.id,
                                team_count: params.team_count,
                                player_role_count: params.player_role_count,
                                team_no: params.team_no
                            })

                        }

                        await UserTeamCktSchema.updateOne({"_id":ObjectId(params.uteamid)},{"$set":{team_count:params.team_count,player_role_count:params.player_role_count}});
                        await UserPlayerMatchCktsSchema.insertMany(match_player_list);
                    }
                return res.send(response({}, "Match Player List Edit Successfully!.", true));

            } else if (params.type == "Football") {
                const footballDbConnection = await connectWithFootballDb();
                const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);

                const UserPlayerMatchFbsSchema = createUserPlayerMatchFbsModel(vendorDbConnection);
                const UserTeamFbSchema = createUserTeamFbModel(vendorDbConnection);

                let matchDetail = await FbUpcomingsSchema.findOne({ "match_id": params.match_id });

                let currentDates = currentTimeZoneDate() * 1 / 1000;
                let matchDate = matchDetail?.date_start_ist * 1 / 1000;
                if (matchDate < currentDates) {
                    return res.send(response({}, "Match is live now. You cannot join", false))
                }


                let match_player_lists = await UserPlayerMatchFbsSchema.find({ match_id: params.match_id, uteamid: params.uteamid, userid: req.user.id }).lean();

                // let match_player_lists = await userplymfb.find({ match_id: params.match_id });
                let pid = params.pid;
                let v = []
                match_player_lists = await Promise.all(match_player_lists.filter(function (item) {
                    for (let i = 0; i <= pid.length; i++) {
                        if (pid[i] == item.pid) { v.push(item.pid); return item }
                    }
                }))

                let match_player_list = match_player_lists;
                await UserPlayerMatchFbsSchema.deleteMany({ match_id: params.match_id, uteamid: params.uteamid });
                let newAddPlayerPID = await pid.filter(x => !v.includes(x));
                for (let i = 0; i < newAddPlayerPID.length; i++) {
                    match_player_list.push({
                        is_substitue: 0, pid: newAddPlayerPID[i],
                        match_id: params.match_id,
                        uteamid: params.uteamid,
                        userid: req.user.id,
                        //teama_count: params.teama_count,
                        //teamb_count: params.teamb_count,
                        team_no: params.team_no
                    })
                }

                // let liveEmitData = {
                //     "match_id": params.match_id, "type": "m", "fetch_latest": 1, authorization: req.headers.authorization
                // }
                // let sktUrl = (params.type == "Cricket") ? "match_cricket_pool_contest_list_v2_" + dbName : "match_football_pool_contest_list_v2_" + dbName;

                let liveEmitData ={"dbName": dbName,"match_id":params.match_id,"type":"m","userid":req.user.id,
                    "fetch_latest":1,"auth": 1,"authorization": req.headers.authorization};
                console.log("liveEmitData--->>",liveEmitData)
                let sktUrl = (params.type == "Cricket") ? "my_match_cricket_pool_contest_list_v2" : "my_match_football_pool_contest_list_v2";
                socketConnection()
                socket.emit(sktUrl, liveEmitData);
                //socketEmitConnect(sktUrl, liveEmitData);
                await UserTeamFbSchema.updateOne({"_id":ObjectId(params.uteamid)},{"$set":{team_count:params.team_count,player_role_count:params.player_role_count}});

                await UserPlayerMatchFbsSchema.insertMany(match_player_list)
                return res.send(response({}, "Match Player List Edit Successfully!.", true));
            }
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    edit_series_player_list: async (req, res, next) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UserPlayersCktSchema = createUserPlayersCktModel(vendorDbConnection);
            const UserPlayersFbSchema = createUserPlayersFbModel(vendorDbConnection);

            const params = req.body;
            if (params.type == "Cricket") {
                let series_player_lists = await UserPlayersCktSchema.find({ league_id: params.league_id, uteamid: params.uteamid });

                let pid = params.pid;
                let v = []
                series_player_lists = await Promise.all(series_player_lists.filter(function (item) {
                    for (let i = 0; i <= pid.length; i++) {
                        if (pid[i] == item.pid) { v.push(item.pid); return item }
                    }
                }))

                let series_player_list = series_player_lists;
                await UserPlayersCktSchema.deleteMany({ league_id: params.league_id, uteamid: params.uteamid, is_substitue: params.is_substitue });

                let newAddPlayerPID = await pid.filter(x => !v.includes(x));
                for (let i = 0; i < newAddPlayerPID.length; i++) {
                    series_player_list.push({
                        is_substitue: params.is_substitue, pid: newAddPlayerPID[i],
                        league_id: params.league_id,
                        uteamid: params.uteamid,
                        userid: req.user.id,
                        team_count: params.team_count,
                        team_no: params.team_no
                    })
                }

                await UserPlayersCktSchema.insertMany(series_player_list)
                return res.send(response({}, "Series Player List Edit Successfully!.", true));

            } else if (params.type == "Football") {
                let series_player_lists = await UserPlayersFbSchema.find({ league_id: params.league_id, is_substitue: params.is_substitue });
                let pid = params.pid;
                let v = []
                series_player_lists = await Promise.all(series_player_lists.filter(function (item) {
                    for (let i = 0; i <= pid.length; i++) {
                        if (pid[i] == item.pid) { v.push(item.pid); return item }
                    }
                }))

                let series_player_list = series_player_lists;
                await UserPlayersFbSchema.deleteMany({ league_id: params.league_id, uteamid: params.uteamid });
                let newAddPlayerPID = await pid.filter(x => !v.includes(x));
                for (let i = 0; i < newAddPlayerPID.length; i++) {
                    series_player_list.push({
                        is_substitue: params.is_substitue, pid: newAddPlayerPID[i],
                        league_id: params.league_id,
                        uteamid: params.uteamid,
                        userid: req.user.id,
                        team_count: params.team_count,
                        team_no: params.team_no
                    })
                }

                await UserPlayersFbSchema.insertMany(series_player_list)
                return res.send(response({}, "Series Player List Edit Successfully!.", true));
            }
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    add_coins: async (req, res, next) => {
        try {

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    live_score: async (req, res, next) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const CktMatchScoresSchema = createCktMatchScoresModel(cktDbConnection);

            const params = req.body
            let page = parseInt(req.query.page || 1)
            let limit = parseInt(req.query.limit || 10);
            let startIndex = (page - 1) * limit;
            let endIndex = page * limit;

            let livescore_ckt = await CktMatchScoresSchema.findOne({ "match_id": params.match_id })


            return res.send(response(livescore_ckt, "Score list view Successfully!.", true));
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    commentary_score_list: async (req, res, next) => {
        try {
            const params = req.body
            let live_score = {}
            let commentary = {}
            let livefullscore = {}
            let player_list = {}

            const dbName = req.user.dbName;
            params.match_id=parseInt(params.match_id);
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const JoinMatchContestsSchema = createJoinMatchContestsModel(vendorDbConnection);
            const PoolSchema = createPoolModel(vendorDbConnection);
            let upcomingData=null;

            if (params.type == "ckt") {
                const cktDbConnection = await connectWithCricketDb();
                const CktCommentarySchema = createCktCommentaryModel(cktDbConnection);
                const CktPlayerMetaDataSchema = createCktPlayerMetaDataModel(cktDbConnection);
                const CktPlayersFantasyPointsSchema = createCktPlayersFantasyPointsModel(cktDbConnection);
                const UpcomingCricketSchema=createUpcomingCricketModel(cktDbConnection);
                const CktPlayersSchema = createCktPlayersModel(cktDbConnection);
                const CktMatchScoresSchema = createCktMatchScoresModel(cktDbConnection);
                
                upcomingData=await UpcomingCricketSchema.findOne({"match_id": params.match_id});
                
                commentary = await CktCommentarySchema.find({ match_id: params.match_id }).sort({ innings: 1 })
                
                if (commentary?.length > 1 && commentary?.[1]?.innings == 2 && commentary?.[1]?.commentaries != undefined) {
                    commentary = commentary[1]
                } else if (commentary.length > 0) {
                    commentary = commentary[0]
                }
                

                livefullscore = await CktMatchScoresSchema.findOne({ match_id: params.match_id })
                
                let awsImgUrl = `${env.awsimgurl}profile_doc/`;
                player_list = await CktPlayersSchema.aggregate([
                    { $match: { match_id: params.match_id } }, // Match players by match ID
                
                    // Lookup player details
                    {
                        "$lookup": {
                            from: "ckt_player_details",
                            localField: "pid",
                            foreignField: "pid",
                            as: "plydetail"
                        }
                    },
                    { "$unwind": "$plydetail" },
                
                    // Lookup player meta data
                    {
                        "$lookup": {
                            from: "ckt_player_meta_data",
                            localField: "pid",
                            foreignField: "pid",
                            as: "player_meta_data"
                        }
                    },
                    { 
                        "$unwind": { 
                            "path": "$player_meta_data", 
                            "preserveNullAndEmptyArrays": true 
                        }
                    },
                
                    // Lookup fantasy points
                    {
                        "$lookup": {
                            from: "ckt_players_fantasy_points",
                            localField: "pid",
                            foreignField: "pid",
                            as: "players_fantasy_points",
                            pipeline:[
                                {
                                    "$match":{
                                        "match_id":params.match_id
                                    }
                                }
                            ]
                        }
                    },
                    { 
                        "$unwind": { 
                            "path": "$players_fantasy_points", 
                            "preserveNullAndEmptyArrays": true 
                        }
                    },
                
                    // Final Projection
                    {
                        "$project": {
                            "pid": 1,
                            "title": "$plydetail.title",
                            "team_id": "$tid",
                            "selected_by": 1,
                            "fantasy_point": "$players_fantasy_points.tp",
                            "thumb_url": {
                                "$concat": [awsImgUrl, "$player_meta_data.logo_url"]
                            },
                            "playing_role":"$plydetail.playing_role",
                            "league_id":upcomingData.cid
                        }
                    }
                ]);
                console.log("player_list-->>",player_list.length);
                
                //.find({ match_id: params.match_id, is_playing: 1 }).lean();

                // if (player_list.length == 0) {
                //     player_list = await CktPlayersSchema.find({ match_id: params.match_id, is_playing: 2 }).lean();
                //     // player_list.fantasy_point = 0;
                // }

                let user_player_join = await JoinMatchContestsSchema.aggregate([
                    { $match: { match_id: params.match_id } },
                    {
                        "$lookup": {
                            from: "user_player_match_ckts",
                            localField: "uteamid",
                            foreignField: "uteamid",
                            as: "plylist"
                        }
                    },
                    {
                        "$unwind": "$plylist"
                    },
                    {
                        "$group": {
                            _id: { "pid": "$plylist.pid" }, pid: { "$first": "$plylist.pid" },
                            count: { $sum: 1 }
                        }
                    }
                ])

                let totalUsrCnt = await JoinMatchContestsSchema.countDocuments({ match_id: params.match_id });

                //else {
                player_list = await Promise.all(player_list.map(async (item) => {
                    // let cktFantasyPoint = await CktPlayersFantasyPointsSchema.findOne({ match_id: params.match_id, pid: item.pid }, { tp: 1 }).sort({ _id: -1 }).lean();
                    // item.fantasy_point = (cktFantasyPoint && cktFantasyPoint.tp) ? cktFantasyPoint.tp : 0;

                    /* Start selected Counts Calculation For player Accumulator && Contest Accumulator*/
                    let player_match_deatil = await CktPlayersSchema.distinct("match_id", { tid: item.tid });

                    if (player_match_deatil.length > 0) {

                        //Todo: Not using this
                        // let active_match = await PoolSchema.aggregate([
                        //     { $match: { match_id: { $in: player_match_deatil } } },
                        //     {
                        //         $group: {
                        //             "_id": { "gtype": "$gtype" }, match_id: { $first: "$match_id" }
                        //         }
                        //     }
                        // ])

                        //  let user_player_join =  await joinsaccplysSchema.aggregate([
                        //     { $match:{match_id:item.match_id,pid:item.pid} },
                        //     {
                        //         "$group":{
                        //             _id:{"pid":"$pid"},
                        //             count: {$sum: 1}
                        //         }
                        //     }
                        //    ])



                        let plyCnt = user_player_join.filter(x => x["pid"] === item.pid);
                        plyCnt = plyCnt && plyCnt.length > 0 ? plyCnt[0]["count"] : 0;



                        // if (active_match.length > 0 && user_player_join.length > 0) {
                        //     active_match = active_match.length;
                        //     user_player_join = user_player_join.length;


                        item.selected_by = (totalUsrCnt > 0) ? (plyCnt * 100 / totalUsrCnt).toFixed(2) : 0 //(user_player_join * 100) / totalUsrCnt

                        // } else {
                        //     item.selected_by = 0;
                        // }

                    }
                    /* End selected Counts Calculation For player Accumulator && Contest Accumulator */

                    return item;
                }))
                //  }

                if (player_list) {

                    // PlyList = await Promise.all(player_list.map(async (item) => {
                    //     //let playerLogo = await CktPlayerMetaDataSchema.findOne({ pid: item.pid, });
                    //     if (playerLogo) {
                    //         return item.thumb_url = `${env.awsimgurl}profile_doc/${playerLogo.logo_url}`
                    //     }
                    // }))
                }

                
                
                console.log("livefullscore-->>",livefullscore);
                if (livefullscore?.teama?.team_id) {
                    const CktTeamMetaDataSchema = createCktTeamMetaDataModel(cktDbConnection);

                    let teamMeta = await CktTeamMetaDataSchema.find({
                        team_id: { "$in": [upcomingData.teama.team_id, upcomingData.teamb.team_id] }
                    })
                    let teamDetailMetaA = teamMeta.filter(x => x.team_id == upcomingData.teama.team_id);
                    teamDetailMetaA = teamDetailMetaA && teamDetailMetaA[0];
                    let teamDetailMetaB = teamMeta.filter(x => x.team_id == upcomingData.teamb.team_id);
                    teamDetailMetaB = teamDetailMetaB && teamDetailMetaB[0];
                    livefullscore.teama.logo_url = (teamDetailMetaA && teamDetailMetaA.logo_url) ? `${env.awsimgurl}profile_doc/${teamDetailMetaA.logo_url}` : livefullscore.teama.logo_url;
                    livefullscore.teamb.logo_url = (teamDetailMetaB && teamDetailMetaB.logo_url) ? `${env.awsimgurl}profile_doc/${teamDetailMetaB.logo_url}` : livefullscore.teamb.logo_url;
                }else{
                    livefullscore={"teama":upcomingData?.teama,"teamb":upcomingData?.teamb};
                }

                live_score = { commentary_ckt: commentary, livescore_ckt: livefullscore, player_list: player_list }

            } else {
                const footballDbConnection = await connectWithFootballDb();
                const FbPlayersSchema = createFbPlayersModel(footballDbConnection);
                const FbScoresSchema = createFbScoresModel(footballDbConnection);
                const FbHighlightVideoSchema = createFbHighlightVideoModel(footballDbConnection);
                const FbCommentarySchema = createFbCommentaryModel(footballDbConnection);
                const FbPlayerFantasyPointsSchema = createFbPlayerFantasyPointsModel(footballDbConnection);
                const FbTeamsSchema = createFbTeamsModel(footballDbConnection);
                const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);

                const UserPlayerMatchFbsSchema = createUserPlayerMatchFbsModel(vendorDbConnection);
                const FbPlayerDetailsSchema = createFbPlayerDetailsModel(footballDbConnection);

                
                let fbUpcomDetail = await FbUpcomingsSchema.findOne({ match_id: params.match_id });
                commentary = await FbCommentarySchema.findOne({ match_id: params.match_id })
                livefullscore = await FbScoresSchema.findOne({ match_id: params.match_id }).lean();
                //  stats
                if (livefullscore && livefullscore.lineup && livefullscore.lineup.data.length > 0) {

                    //let benchList = (livefullscore && livefullscore.bench && livefullscore.bench.data) ? livefullscore.bench.data : [];
                    let playerList = livefullscore.lineup.data;//.concat(benchList)
                    let totalUsrCnt = await JoinMatchContestsSchema.countDocuments({ match_id: params.match_id });

                    livefullscore.lineup.data = await Promise.all(playerList.map(async (item) => {
                        let pID=item.player_id;
                        let plyDetail = await FbPlayerDetailsSchema.findOne({pid: pID},{"pid":1,"common_name":1,"image_path":1}).lean();
                        // let bench_lineup_type = item.type;
                        // let plrStats = item.stats
                        // let checkBenchPly = ((bench_lineup_type == "lineup") || (bench_lineup_type == "bench" && plrStats && plrStats.other && plrStats.other.minutes_played && plrStats.other.minutes_played > 0)) ? true : false;
                        // if (checkBenchPly == true) {
                            let data=plyDetail;
                            item["player"]={data};
                            item["player_name"]=plyDetail["common_name"];

                            let fbFantasyPoint = await FbPlayerFantasyPointsSchema.findOne({ match_id: params.match_id, pid: item.player_id }, { tp: 1 }).lean();
                            item.player.data["fantasy_point"] = (fbFantasyPoint && fbFantasyPoint.tp) ? fbFantasyPoint.tp : 0;

                            /* Start selected Counts Calculation For player Accumulator && Contest Accumulator*/
                            let player_match_deatil = await FbPlayersSchema.distinct("match_id", { $or: [{ "teama.team_id": item.tid }, { "teamb.team_id": item.tid }] });

                            if (player_match_deatil.length > 0) {

                                let active_match = await PoolSchema.aggregate([
                                    { $match: { match_id: { $in: player_match_deatil } } },
                                    {
                                        $group: {
                                            "_id": { "gtype": "$gtype" }, match_id: { $first: "$match_id" }
                                        }
                                    }
                                ])

                                let user_player_join = await UserPlayerMatchFbsSchema.aggregate([
                                    { $match: { match_id: item.match_id, pid: item.player_id } },
                                    {
                                        "$group": {
                                            _id: { "pid": "$pid" },
                                            count: { $sum: 1 }
                                        }
                                    }
                                ])

                                let plyCnt = user_player_join.filter(x => x["pid"] === item.player_id);
                                plyCnt = plyCnt && plyCnt.length > 0 ? plyCnt[0]["count"] : 0;


                                if (active_match.length > 0 && user_player_join.length > 0) {
                                    active_match = active_match.length;
                                    user_player_join = user_player_join.length;
                                    //item.player.data.selected_by = (user_player_join * 100) / active_match
                                    item.player.data.selected_by = (totalUsrCnt > 0) ? (plyCnt * 100 / totalUsrCnt).toFixed(2) : 0

                                } else {
                                    item.player.data.selected_by = 0;
                                }

                            }
                            /* End selected Counts Calculation For player Accumulator && Contest Accumulator */

                            return item;
                        //}
                    }))
                    livefullscore.lineup.data = livefullscore.lineup.data.filter(item => item != null);
                    console.log("livefullscore.lineup--->>",livefullscore.lineup);
                }
                

                livefullscore=(livefullscore)?livefullscore:{};
                livefullscore["localteam"]=fbUpcomDetail?.localTeam?.data;
                livefullscore["visitorteam"]=fbUpcomDetail?.visitorTeam?.data;

                // localteam_id   visitorteam_id        //localteam  livematchfullscore
                // let livematchfullscore = await fbmatchstaticsScoreSchema.findOne({ match_id: params.match_id })
                // console.log("livefullscorelivefullscore",livefullscore)
                if (livefullscore && livefullscore.localteam) {

                } else {
                    if (livefullscore && livefullscore.localteam_id) {
                        let teamMeta = await FbTeamsSchema.find({
                            team_id: { "$in": [livefullscore.localteam_id, livefullscore.visitorteam_id] }
                        })

                        let teamDetailMetaA = teamMeta.filter(x => x.team_id == livefullscore.localteam_id);
                        teamDetailMetaA = teamDetailMetaA && teamDetailMetaA[0];

                        let teamDetailMetaB = teamMeta.filter(x => x.team_id == livefullscore.visitorteam_id);
                        teamDetailMetaB = teamDetailMetaB && teamDetailMetaB[0];

                        livefullscore.localteam = teamDetailMetaA;
                        livefullscore.visitorteam = teamDetailMetaB;
                        //  console.log("livefullscorelivefullscore",teamDetailMetaA, livefullscore.localteam,livefullscore.localteam_id,livefullscore.visitorteam_id);
                    }
                }

                let highlightsVideo = await FbHighlightVideoSchema.findOne({ match_id: params.match_id })
                if (!highlightsVideo) { highlightsVideo = {} }
                //  livematchfullscore
                live_score = { commentary_fb: commentary, livescore_fb: livefullscore, livematchfullscore: livefullscore, highlightsVideo: highlightsVideo }
            }

            return res.send(response(live_score, "Score And Commentary list view Successfully!.", true));
        } catch (error) {
            console.log("error-->>",error)
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    fb_live_score: async (req, res, next) => {
        try {
            const footballDbConnection = await connectWithFootballDb();
            const FbScoresSchema = createFbScoresModel(footballDbConnection);

            const params = req.body
            let page = parseInt(req.query.page || 1)
            let limit = parseInt(req.query.limit || 10);
            let startIndex = (page - 1) * limit;
            let endIndex = page * limit;

            let livescore_ckt = await FbScoresSchema.findOne({ "match_id": params.match_id })


            return res.send(response(livescore_ckt, "Score list view Successfully!.", true));
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    series_team_stats_list: async (req, res, next) => {
        try {
            const params = req.body;
            let send_array = {};
            if (params.type == 'ckt') {
                const cktDbConnection = await connectWithCricketDb();
                const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);
                const CktSeriesTeamBowlStatsSchema = createCktSeriesTeamBowlStatsModel(cktDbConnection);
                const CktSeriesTeamSchema = createCktSeriesTeamModel(cktDbConnection);
                const CktSeriesTeamBatStatsSchema = createCktSeriesTeamBatStatsModel(cktDbConnection);

                let league_detail = await CktLeaguesSchema.findOne({ cid: params.cid }, { name: 1, date_start: 1, date_end: 1, logo_url: 1 }).lean();
                if (league_detail && league_detail.logo_url) {
                    league_detail.logo_url = `${env.awsimgurl}profile_doc/${league_detail.logo_url}`
                }
                let cktSeriesTeamList = await CktSeriesTeamSchema.find({ cid: params.cid });
                // let cktSeriesTeamStatsBatList = await cktSeriesTeamStatsBatSchema.find({cid:params.cid});

                let cktSeriesTeamStatsBatList = await CktSeriesTeamBatStatsSchema.aggregate([
                    {
                        "$match": { cid: params.cid }
                    },
                    {
                        "$group": { _id: { "pid": "$player.pid" }, "player": { "$first": "$player" }, "average": { "$first": "$average" }, "innings": { "$first": "$innings" }, "runs": { "$first": "$runs" } }
                    }
                ])

                let cktSeriesTeamStatsBowlList = await CktSeriesTeamBowlStatsSchema.find({ cid: params.cid });

                send_array = { league_detail: league_detail, cktSeriesTeamList: cktSeriesTeamList, cktSeriesTeamStatsBatList: cktSeriesTeamStatsBatList, cktSeriesTeamStatsBowlList: cktSeriesTeamStatsBowlList }
            } else if (params.type == 'fb') {
                const footballDbConnection = await connectWithFootballDb();
                const FbSeriesTeamStatsSchema = createFbSeriesTeamStatsModel(footballDbConnection);
                const FbSeriesTeamSchema = createFbSeriesTeamModel(footballDbConnection);
                const FbLeaguesSchema = createFbLeaguesModel(footballDbConnection);

                let league_detail = await FbLeaguesSchema.findOne({ league_id: params.cid }, { name: 1, date_start: 1, date_end: 1, logo_path: 1 }).lean();
                let fbSeriesTeam = await FbSeriesTeamSchema.find({ league_id: params.cid });
                let fbSeriesTeamStats = await FbSeriesTeamStatsSchema.find({ league_id: params.cid }).sort({ updatedAt: -1 });
                send_array = { league_detail: league_detail, fbSeriesTeamList: fbSeriesTeam, fbSeriesTeamStatsList: fbSeriesTeamStats }
            }
            return res.send(response(send_array, "Series list view Successfully!.", true));
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    series_match_list: async (req, res, next) => {
        try {
            const params = req.body;
            let match_list = [];

            if (params.type == 'ckt') {
                const cktDbConnection = await connectWithCricketDb();
                const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);
                const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);
                

                match_list = await UpcomingCricketsSchema.find({ cid: params.cid }).lean();
                if (match_list && match_list.length > 0) {
                    match_list = await Promise.all(match_list.map(async (item) => {
                        let league_detail = await CktLeaguesSchema.findOne({ cid: item.cid })
                        item.league_detail = league_detail;
                        return item;
                    }))
                }
            } else if (params.type == 'fb') {
                const footballDbConnection = await connectWithFootballDb();
                const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);
                const FbLeaguesSchema = createFbLeaguesModel(footballDbConnection);
                console.log("params--->>",params);

                match_list = await FbUpcomingsSchema.find({ season_id: params.cid }, { league_id: 1, match_id: 1, teama: 1, teamb: 1, title: 1, status: 1, date_start_ist: 1, scores: 1, date_start: 1, result: 1, status_note: 1 }).lean();

                // if (match_list && match_list.length > 0) {
                //     match_list = await Promise.all(match_list.map(async (item) => {
                //         let league_detail = await FbLeaguesSchema.findOne({ league_id: item.league_id }, { name: 1, logo_path: 1, league_id: 1 })
                //         item.league_detail = league_detail;
                //         return item;
                //     }))
                // }
            }
            return res.send(response(match_list, "Series Match list view Successfully!.", true));
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    team_profile_detail: async (req, res, next) => {
        try {
            let body_data = req.body;
            console.log("body_data-->>",body_data)
            let send_array = {}

            if (body_data.gametype == 'ckt') {
                const cktDbConnection = await connectWithCricketDb();
                const CktTeamsSchema = createCktTeamsModel(cktDbConnection);
                const CktTeamFantasyPointsSchema = createCktTeamFantasyPointsModel(cktDbConnection);
                const CktPlayerMetaDataSchema = createCktPlayerMetaDataModel(cktDbConnection);
                const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);
                const CktPlayersFantasyPointsSchema = createCktPlayersFantasyPointsModel(cktDbConnection);
                const CktIccRankingSchema = createCktIccRankingModel(cktDbConnection);
                const CktPlayersSchema=createCktPlayersModel(cktDbConnection);

                let date = new Date();

                let upcommingmatches = await UpcomingCricketsSchema.find({ "$or": [{ "teama.team_id": body_data.team_id }, { "teamb.team_id": body_data.team_id }], "date_start_ist": { "$gte": date } }, { match_id: 1, cid: 1, date_start_ist: 1, title: 1, format_str: 1 }).sort({ date_start_ist: 1 }).limit(5).lean();

                let recentperformance = await UpcomingCricketsSchema.find({ "$or": [{ "teama.team_id": body_data.team_id }, { "teamb.team_id": body_data.team_id }], "date_start_ist": { "$lte": date } }, { match_id: 1, cid: 1, date_start_ist: 1, title: 1, format_str: 1, winning_team_id: 1 }).sort({ date_start_ist: -1 }).limit(5).lean();

                let team_player = await CktTeamsSchema.findOne({ "team_id": body_data.team_id }, { players: 1, team: 1 }).lean();

                let ckt_team_fantacy_points = await CktTeamFantasyPointsSchema.findOne({ "team_id": body_data.team_id }, { tp: 1 }).sort({ _id: -1 }).lean();

                let ckt_team_fantacy_avg_points = await CktTeamFantasyPointsSchema.find({ "team_id": body_data.team_id }, { tp: 1 }).sort({ _id: -1 }).limit(5).lean();

                //let team_player=(upcommingmatches?.[0]?.teama?.team_id==body_data?.team_id)?upcommingmatches?.[0]?.teama:upcommingmatches?.[0]?.teamb;
                console.log("team1Playerupcommingmatches--->>",upcommingmatches);
                //team_player = (team_player) ? team_player : {};
                let team_logo_url = '';
                let team_thumb_url = '';
                if (team_player?.team?.logo_url) {
                    team_logo_url = team_player.team.logo_url;
                    team_thumb_url = team_player.team.thumb_url;
                }

                if (ckt_team_fantacy_points && team_player.team) {
                    team_player.team.fantasy_points = ckt_team_fantacy_points.tp;
                    team_player.team.logo_url = team_logo_url;
                    team_player.team.thumb_url = team_thumb_url;

                } else {
                    team_player["team"] = { "fantasy_points": 10 };
                    //team_player.team.fantasy_points = 0;
                    team_player["team"] = { "thumb_url": team_logo_url };
                    team_player["team"] = { "logo_url": team_thumb_url };
                }
                

                if (ckt_team_fantacy_avg_points && ckt_team_fantacy_avg_points.length > 0) {
                    let avg_tp = ckt_team_fantacy_avg_points.reduce((a, b) => ({ tp: a.tp + b.tp }));
                    team_player.team.fantasy_avg_points = (avg_tp.tp / 5).toFixed(2);
                } else {
                    // team_player["team"]={"fantasy_points":0};
                    team_player.team.fantasy_avg_points = 0;
                }

                let getlastMatchId = await CktPlayersFantasyPointsSchema.find({ "team_id": body_data.team_id },{match_id:1}).sort({ _id: -1 }).limit(1).lean();
                let lastMatchId=(getlastMatchId?.length>0)?getlastMatchId[0]["match_id"]:"";
                let cktplayerFantasyPoint = await CktPlayersFantasyPointsSchema.find({"match_id":lastMatchId, "team_id": body_data.team_id }, { tp: 1 }).sort({ _id: -1 }).lean();
                let tpData={};
                cktplayerFantasyPoint.forEach(item=>{
                    tpData[item.pid]=item.tp;
                })
                
                let getTeamPlayer = await CktPlayersSchema.find({ "team_id": body_data.team_id }, { players: 1, team: 1 }).sort({_id:-1}).limit(1).lean();
                let getMatchId=getTeamPlayer?.[0]?.["match_id"];
                //let getCktPlayersList=await CktPlayersSchema.find({"match_id":getMatchId});
                let playerList = await CktPlayersSchema.aggregate([
                    {
                        "$match":{ match_id: getMatchId }
                    },
                    {
                        $lookup:
                        {
                            from: "ckt_player_details",
                            localField: "pid",
                            foreignField: "pid",
                            as: "player_detail",
                        },
                    },
                    {
                        $unwind: {
                            "path": "$player_detail",
                            "preserveNullAndEmptyArrays": true
                        }
                    },
                    {
                        $lookup:
                        {
                            from: "ckt_player_meta_data",
                            localField: "pid",
                            foreignField: "pid",
                            as: "player_meta_data",
                        },
                    },
                    {
                        $unwind: {
                            "path": "$player_meta_data",
                            "preserveNullAndEmptyArrays": true
                        }
                    },
                    {
                        $lookup:
                        {
                            from: "ckt_players_fantasy_points",
                            localField: "pid",
                            foreignField: "pid",
                            as: "players_fantasy_points",
                            pipeline:[
                                {
                                    "$match":{
                                        "match_id":getMatchId
                                    }
                                }
                            ]
                        },
                    },
                    {
                        $unwind: {
                            "path": "$players_fantasy_points",
                            "preserveNullAndEmptyArrays": true
                        }
                    },
                    {
                        "$project":{
                            "team_id":"$tid","league_id":"","pid":1,"title":"$player_detail.title","playing_role":"$player_detail.playing_role",
                            "player_id":"$pid","player_name":"$player_detail.common_name","fantasy_point":"$players_fantasy_points.tp",
                            "logo_url": { "$concat": ["profile_doc/", "$player_meta_data.logo_url"] },
                            "team_id":"$tid"

                        }
                    }
                ]);

                team_player.players = playerList;
                // getCktPlayersList?.map(async (plyitem) => {
                //     //let cktplayerFantasyPoint = await CktPlayersFantasyPointsSchema.findOne({ "team_id": body_data.team_id, pid: plyitem.pid }, { tp: 1 }).sort({ _id: -1 }).lean();
                //     plyitem.fantasy_point = tpData[plyitem.pid];
                //     return plyitem;
                // })

                //console.log("playerList--->>",team_player);
                let iccrankings_batsmen = await CktIccRankingSchema.findOne({ type: new RegExp("tests", "i"), team: new RegExp(team_player.team.title, "i"), player_type: 'teams' }, { rank: 1, rating: 1, points: 1, team: 1 })



                if (iccrankings_batsmen) {
                    team_player.team.icc_test_rank = iccrankings_batsmen.rank;
                    team_player.team.icc_test_rating = iccrankings_batsmen.rating;
                    team_player.team.icc_test_points = iccrankings_batsmen.points;
                } else {
                    team_player.team.icc_test_rank = 0;
                    team_player.team.icc_test_rating = 0;
                    team_player.team.icc_test_points = 0;
                }


                let iccrankings_odis = await CktIccRankingSchema.findOne({ type: new RegExp("odis", "i"), team: new RegExp(team_player.team.title, "i"), player_type: 'teams' }, { rank: 1, rating: 1, points: 1, team: 1 })


                if (iccrankings_odis) {
                    team_player.team.icc_odi_rank = iccrankings_odis.rank;
                    team_player.team.icc_odi_rating = iccrankings_odis.rating;
                    team_player.team.icc_odi_points = iccrankings_odis.points;
                } else {
                    team_player.team.icc_odi_rank = 0;
                    team_player.team.icc_odi_rating = 0;
                    team_player.team.icc_odi_points = 0;
                }

                if (upcommingmatches && upcommingmatches.length > 0) {
                    upcommingmatches = await Promise.all(upcommingmatches.map((item) => {
                        // item.title
                        //    item.vs =  item?.title.split('vs')[0] == team_player.team?.title ? item?.title.split('vs')[0].trim() : item?.title.split('vs')[1].trim()
                        item.vs = item?.title.split('vs')[0].trim() == team_player.team?.title ? item?.title.split('vs')[1].trim() : item?.title.split('vs')[0].trim()
                        return item;
                    }))
                }

                if (recentperformance && recentperformance.length > 0) {
                    recentperformance = recentperformance.map((item) => {
                        if (item.winning_team_id == body_data.team_id) {
                            item.winning_team = 'Win';
                        } else {
                            item.winning_team = 'Lose';
                        }


                        item.vs = item?.title.split('vs')[0].trim() == team_player.team?.title ? item?.title.split('vs')[1].trim() : item?.title.split('vs')[0].trim()

                        return item;
                    })
                }

                
                if (team_player?.players) {
                    dataPlayerList = await Promise.all(team_player?.players?.map(async (item) => {
                        let playerLogo = await CktPlayerMetaDataSchema.findOne({ pid: item.pid });
                        if (playerLogo) {
                            return item.thumb_url = `${env.awsimgurl}profile_doc/${playerLogo.logo_url}`
                        }
                    }))
                }

                send_array = { upcommingmatches: upcommingmatches, recentperformance: recentperformance, team_player: team_player.players, team_detail: team_player.team }

            } else if (body_data.gametype == 'fb') {
                const footballDbConnection = await connectWithFootballDb();
                const FbTeamsSchema=createFbTeamsModel(footballDbConnection);
                const FbTeamStatesSchema = createFbTeamStatesModel(footballDbConnection);
                const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);
                const FbCountriesSchema = createFbCountriesModel(footballDbConnection);

                let recentperformance = {};
                let upcommingmatches = {};
                let team_detail = {};
                let date = new Date();
                
                recentperformance = await FbUpcomingsSchema.find({
                    "$or": [{ "teama.team_id": body_data.team_id }, { "teamb.team_id": body_data.team_id }], "date_start_ist": { "$lte": date }, rstatus: 3,
                    //"is_active": 1,
                    //"is_allpublish": 1
                }, { match_id: 1, league_id: 1, league_name: 1, season_id: 1, date_start_ist: 1, title: 1, winner_team_id: 1, scores: 1, visitorTeam: 1, teama: 1, teamb: 1 }).sort({ date_start_ist: -1 }).lean().limit(5);
                console.log("recentperformance-->>",recentperformance);

                if (recentperformance && recentperformance.length > 0) {
                    recentperformance = recentperformance.map((item) => {
                        item.visitor_team_name = item.visitorTeam.data.name
                        item.ft_scores = item?.scores?.ft_score
                        delete item.visitorTeam
                        delete item.scores
                        if (item.winner_team_id) {
                            if (item.winner_team_id == body_data.team_id) {
                                item.winning_team = 'Win';
                            } else {
                                item.winning_team = 'Lose';
                            }
                        } else {
                            item.winning_team = 'Draw';
                        }
                        if (item.teama.team_id == body_data.team_id) {
                            item.opponent_team = item.teamb.name
                        } else {
                            item.opponent_team = item.teama.name
                        }
                        return item;
                    })
                }

                upcommingmatches = await FbUpcomingsSchema.find({ "$or": [{ "teama.team_id": body_data.team_id }, { "teamb.team_id": body_data.team_id }], "date_start_ist": { "$gte": date } }, { match_id: 1, league_id: 1, league_name: 1, season_id: 1, date_start_ist: 1, title: 1, visitorTeam: 1, teama: 1, teamb: 1 }).sort({ date_start_ist: 1 }).limit(5).lean();

                if (upcommingmatches && upcommingmatches.length > 0) {
                    upcommingmatches = upcommingmatches.map((item) => {
                        item.visitor_team_name = item.visitorTeam.data.name
                        if (item.teama.team_id == body_data.team_id) {
                            item.opponent_team = item.teamb.name
                        } else {
                            item.opponent_team = item.teama.name
                        }
                        delete item.visitorTeam
                        return item
                    })
                }

                //let team_states_detail = await footballTeamStatesSchema.findOne({ "team_id": body_data.team_id }).sort({ createdAt: -1 }).lean();

                // Get the current year
                const currentYear = new Date().getFullYear();

                // Get the start and end dates for the current year
                const startDate = new Date(currentYear, 0, 1); // January 1st of the current year
                const endDate = new Date(currentYear, 11, 31, 23, 59, 59); // December 31st of the current year

                // Query to find the document for the given team_id and within the current year
                let team_states_detail = await FbTeamStatesSchema
                    .findOne({
                        "team_id": body_data.team_id,
                        "createdAt": {
                            $gte: startDate,
                            $lte: endDate
                        }
                    })
                    .sort({ createdAt: -1 })
                    .lean();

                    let fbTeamsDetails=await FbTeamsSchema.findOne({"team_id": body_data.team_id});
                    team_detail = { 
                        venue_id: fbTeamsDetails?.venue_id, 
                        team_id: fbTeamsDetails?.team_id, 
                        country_id: fbTeamsDetails?.country_id, 
                        country_name: fbTeamsDetails?.name ? fbTeamsDetails?.name : "", 
                        createdAt: fbTeamsDetails?.createdAt, 
                        founded: fbTeamsDetails?.founded, 
                        logo_path: fbTeamsDetails?.logo_path, 
                        name: fbTeamsDetails?.name, 
                        short_code: fbTeamsDetails?.short_code, 
                        updatedAt: fbTeamsDetails?.updatedAt, 
                        avg_fantasy_points: 0, 
                        current_standing: 0, 
                       
                    }
                

                if (team_states_detail) {
                    let country_detail = await FbCountriesSchema.findOne({ id: team_states_detail.country_id })

                    
                    console.log("fbTeamsDetails-->>",body_data.team_id,fbTeamsDetails)
                    let team_states_detail_all = await FbTeamStatesSchema
                        .find({
                            "team_id": body_data.team_id,
                            "createdAt": {
                                $gte: startDate,
                                $lte: endDate
                            }
                        },
                            { stats: 1 }
                        )
                        .sort({ createdAt: -1 })
                        .lean();
                    let team_states = [];
                    if (team_states_detail_all && team_states_detail_all.length > 0) {
                        team_states_detail_all = team_states_detail_all.map((item) => {
                            //team_states = item.stats.data[0] 
                            team_states.push(item.stats.data[0]);
                            return item
                        })
                    }

                    //team_detail = { 
                        team_detail["venue_id"]= fbTeamsDetails?.venue_id, 
                        team_detail["twitter"]= team_states_detail?.twitter ? team_states_detail?.twitter : "", 
                        team_detail["vanue_name"]= team_states_detail?.vanue_name, 
                        team_detail["vanue_city"]= team_states_detail?.vanue_city, 
                        team_detail["vanue_image_path"]= team_states_detail?.vanue_image_path, 
                        team_detail["rivals_logo_path"]= team_states_detail?.rivals_logo_path, 
                        team_detail["match_id"]= team_states_detail?.match_id, 
                        team_detail["season_id"]= team_states_detail?.season_id, 
                        team_detail["team_id"]= fbTeamsDetails?.team_id, 
                        team_detail["country_id"]= fbTeamsDetails?.country_id, 
                        team_detail["country_name"]= fbTeamsDetails?.name ? fbTeamsDetails?.name : "", 
                        team_detail["createdAt"]= fbTeamsDetails?.createdAt, 
                        team_detail["founded"]= fbTeamsDetails?.founded, 
                        team_detail["league_id"]= team_states_detail?.league_id, 
                        team_detail["legacy_id"]= team_states_detail?.legacy_id, 
                        team_detail["logo_path"]= fbTeamsDetails?.logo_path, 
                        team_detail["name"]= fbTeamsDetails?.name, 
                        team_detail["national_team"]= team_states_detail?.national_team, 
                        team_detail["short_code"]= fbTeamsDetails?.short_code, 
                        team_detail["updatedAt"]= fbTeamsDetails?.updatedAt, 
                        team_detail["avg_player_rating"]= team_states_detail.stats?.data[0]?.avg_player_rating, 
                        team_detail["avg_player_rating_per_match"]= team_states_detail?.stats?.data[0]?.avg_player_rating_per_match, 
                        team_detail["avg_fantasy_points"]= 0, 
                        team_detail["current_standing"]= 0, 
                        team_detail["statsData"]= team_states, 
                        team_detail["stats"]= team_states_detail.stats.data[0] 
                    //}
                }
                // console.log("team_detail_data",team_detail.stats);
                send_array = { upcommingmatches: upcommingmatches, recentperformance: recentperformance, team_detail: team_detail }
            }
            return res.send(response(send_array, "Team Detail view Successfully!.", true));
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    }
}


const isValidHttpUrl = (string) => {
    //return new Promise((resolve, reject) => {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
    // })
}

//Git commits to be picked by reference and appended to the current working HEAD. Cherry picking is the act of picking a commit from a branch and applying it to another. git cherry-pick can be useful for undoing changes. For example, say a commit is accidently made to the wrong branch. You can switch to the correct branch and cherry-pick the commit to where it should belong.

//git cherry-pick is a useful tool but not always a best practice. Cherry picking can cause duplicate commits and many scenarios where cherry picking would work, traditional merges are preferred instead. With that said git cherry-pick is a handy tool for a few scenarios...
