const response = require("../../helper/response");
const { settingDetail, sortingData, dateTimeZone, keyGen, dateTimeChange, currentTimeZoneDate } = require("../../helper/common");
const { ObjectID, ObjectId } = require("mongodb");
const { socket, socketConnection } = require("./../view_model/Socket");
const { connectWithGeneralDb, connectWithCricketDb, connectWithFootballDb, connectWithVendorDb } = require("../../config/mongodb_connections");
const createCktTeamMetaDataModel = require("../../mongo_models_new/credexon_cricket/CktTeamMetaDataSchema");
const createCktTeamsModel = require("../../mongo_models_new/credexon_cricket/CktTeamsSchema");
const createCktCommentaryModel = require("../../mongo_models_new/credexon_cricket/CktCommentarySchema");
const createCktPlayerMetaDataModel = require("../../mongo_models_new/credexon_cricket/CktPlayerMetaDataSchema");
const createCktLeaguesModel = require("../../mongo_models_new/credexon_cricket/CktLeaguesSchema");
const createUpcomingCricketModel = require('../../mongo_models_new/credexon_cricket/UpcomingCricketsSchema');
const createCricketPlayersModel = require("../../mongo_models_new/credexon_cricket/CktPlayerDetailsSchema");
const createCktPlayerStatesModel = require("../../mongo_models_new/credexon_cricket/CktPlayerStatesSchema");
const createCktSeriesTeamModel = require("../../mongo_models_new/credexon_cricket/CktSeriesTeamSchema");
const createCktSeriesMetaDataModel = require("../../mongo_models_new/credexon_cricket/CktSeriesMetaDataSchema");
const createCktPlayersFantasyPointsModel = require("../../mongo_models_new/credexon_cricket/CktPlayersFantasyPointsSchema");
const createCktPlayersModel = require("../../mongo_models_new/credexon_cricket/CktPlayersSchema");
const createCktMatchScoresModel = require("../../mongo_models_new/credexon_cricket/CktMatchScoresSchema");
const createCktSeriesTeamBatStatsModel = require("../../mongo_models_new/credexon_cricket/CktSeriesTeamBatStatsSchema");
const createCktSeriesTeamBowlStatsModel = require("../../mongo_models_new/credexon_cricket/CktSeriesTeamBowlStatsSchema");
const createFbUpcomingsModel = require("../../mongo_models_new/credexon_football/FbUpcomingsSchema");
const createFbPlayersModel = require("../../mongo_models_new/credexon_football/FbPlayersSchema");
const createFbSeriesTeamStatsModel = require("../../mongo_models_new/credexon_football/FbSeriesTeamStatsSchema");
const createFbTeamMetaDatasModel = require("../../mongo_models_new/credexon_football/FbTeamMetaDatasSchema");
const createFbScoresModel = require("../../mongo_models_new/credexon_football/FbScoresSchema");
const createFbHighlightVideoModel = require("../../mongo_models_new/credexon_football/FbHighlightVideoSchema");
const createFbPlayerDetailsModel = require("../../mongo_models_new/credexon_football/FbPlayerDetailsSchema");
const createFbCommentaryModel = require("../../mongo_models_new/credexon_football/FbCommentarySchema");
const createFbSeriesTeamModel = require("../../mongo_models_new/credexon_football/FbSeriesTeamSchema");
const createFbPlayerFantasyPointsModel = require("../../mongo_models_new/credexon_football/FbPlayerFantasyPointsSchema");
const createFbPlayerStatisticsDetailModel = require("../../mongo_models_new/credexon_football/FbPlayerStatisticsDetailSchema");
const createFbLeaguesModel = require("../../mongo_models_new/credexon_football/FbLeaguesSchema");
const createFbTeamsModel = require("../../mongo_models_new/credexon_football/FbTeamsSchema");
const createContestSeriesModel = require("../../mongo_models_new/credexon_vendor/ContestSeriesSchema");
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
const createUserCktLeagueModel = require("../../mongo_models_new/credexon_vendor/UserCktSeriesTeamSchema");
const createUserFbLeagueModel = require("../../mongo_models_new/credexon_vendor/UserFbSeriesTeamSchema");
const createUpcomingCricketPublishModel = require("../../mongo_models_new/credexon_vendor/UpcomingCricketsSchema");
const createUpcomingFootballPublishModel = require("../../mongo_models_new/credexon_vendor/UpcomingFootballSchema");
const createSettingsModel = require("../../mongo_models_new/credexon_general/SettingSchema");
const createSeriesJoinContestsModel = require("../../mongo_models_new/credexon_vendor/JoinSeriesContestsSchema");
const { cacheStorageGet } = require("../../helper/redis_set_get");
const createFbLeaguesSeasonsModel = require("../../mongo_models_new/credexon_football/FbLeagueSeasonsSchema");
const createFbLeagueDetailsModel = require("../../mongo_models_new/credexon_football/FbLeagueDetailsSchema");


const env = process.env;
module.exports = {
    publish_active_match_list: async (req) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log("---CHECKCHECK----");
                const cktDbConnection = await connectWithCricketDb();
                const CktTeamMetaDataSchema = createCktTeamMetaDataModel(cktDbConnection);
                const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);
                const dbName = req.userData.dbName;
                
                const vendorDbConnection = await connectWithVendorDb(dbName);
                const UpcomingCktPubSchema = createUpcomingCricketPublishModel(vendorDbConnection);
                let params = req
                
                const page = parseInt(req.page || 1)
                let limit = parseInt(req.limit || 10);
                const startIndex = (page - 1) * limit;
                const endIndex = page * limit;

                
                params.rstatus = parseInt(params.rstatus);
                limit = (params.rstatus === 3) ? 20 : limit;
                let d_sort = (params.rstatus === 3) ? -1 : 1;
                let sort_match = (params.rstatus === 3) ? { date_start_ist: d_sort } : { date_start_ist: d_sort };

                
                let rStatus = (params.rstatus === 3) ? { "$in": [3, 4] } : params.rstatus;
                //limit and pagination 

                
                let currentDate = currentTimeZoneDate();
                let condition={
                    rstatus: rStatus,
                    "is_active": 1, // Todo: Need to remove dbkey
                    "is_publish": 1, // Todo: Need to remove dbkey
                    date_start_ist: { "$gte": new Date(((currentDate / 1000) - (60 * 60 * 24 * 30)) * 1000) }
                }

                
                let cktUpPub=await UpcomingCktPubSchema.find(condition,{"match_id":1});
                console.log("cktUpPubcktUpPub--->>",cktUpPub);
                let matchIdPub=[];
                if(cktUpPub?.length>0){
                    for(let i=0;i<cktUpPub?.length;i++){
                        matchIdPub.push(cktUpPub[i]["match_id"]);
                    }
                }
                console.log("conditionmatchIdPub--->>",matchIdPub);
                
                

                let match_list = await UpcomingCricketsSchema.aggregate([
                    {
                        "$match":{"match_id":{"$in":matchIdPub}}
                    },
                    {"$sort":sort_match},
                    {
                        $lookup: {
                          from: "ckt_team_meta_data",
                          localField: "teama.team_id",
                          foreignField: "team_id",
                          as: "team_meta_a",
                        },
                      },
                      {
                        $unwind: {
                            "path": "$team_meta_a",
                            "preserveNullAndEmptyArrays": true
                        }
                      },
                      {
                        $lookup: {
                          from: "ckt_team_meta_data",
                          localField: "teamb.team_id",
                          foreignField: "team_id",
                          as: "team_meta_b",
                        },
                      },
                      {
                        $unwind: {
                            "path": "$team_meta_b",
                            "preserveNullAndEmptyArrays": true
                        }
                    },
            ]);

                let newMatchList = [];

                if(match_list?.length>0){
                    for(let i=0;i<match_list?.length;i++){
                        let item=match_list[i];
                        //let timeZoneSet = (req.timezone) ? req.timezone : null;
                        let objTeam = {
                            _id: item._id,
                            match_id: item.match_id,
                            title: item.title,
                            match_status: item.rstatus,
                            date_start: item.date_start_ist,//dateTimeZone(item.date_start_ist, timeZoneSet),////dateTimeZone(item.date_start_ist,null),
                            date_end: item.date_end_ist,
                            short_title: item.short_title,
                            teama_id: item.teama.team_id,
                            teama_name: item.teama.name,
                            teama_short_name: (item?.team_meta_a?.short_name) ? item?.team_meta_a?.short_name : item.teama.short_name,
                            teama_logo: (item?.team_meta_a?.logo_url) ? `${env.awsimgurl}profile_doc/${item?.team_meta_a?.logo_url}` : item.teama.logo_url,
                            teamb_id: item.teamb.team_id,
                            teamb_name: item.teamb.name,
                            teamb_short_name: (item?.team_meta_b?.short_name) ? item?.team_meta_b?.short_name : item.teamb.short_name,
                            teamb_logo: (item?.team_meta_b?.logo_url) ? `${env.awsimgurl}profile_doc/${item?.team_meta_b?.logo_url}` : item.teamb.logo_url,
                            league_name: item.competition.title,
                            is_playing11: item.is_playing11
                        }
                        newMatchList.push(objTeam);
                    }
                }
                
                let total_count = await UpcomingCktPubSchema.countDocuments(condition);

                resolve({
                    total_count: total_count,
                    status_key: params.rstatus,
                    match_list: newMatchList,
                    status: match_list.length > 0 ? true : false,
                });

            } catch (error) {
                console.log("error--->",error)
                resolve(response({}, "Something went wrong.!!!", false, null, error.stack));
            }
        })
    },
    publish_active_football_list: async (req) => {
        return new Promise(async (resolve, reject) => {
            const params = req;
            try {
                const footballDbConnection = await connectWithFootballDb();
                const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);
                const dbName = req.userData.dbName;
                const vendorDbConnection = await connectWithVendorDb(dbName);
                const UpcomingFbPubSchema = createUpcomingFootballPublishModel(vendorDbConnection);

                const page = parseInt(req.page || 1)
                let limit = parseInt(req.limit || 10);
                const startIndex = (page - 1) * limit;
                const endIndex = page * limit;

                params.rstatus = parseInt(params.rstatus);
                limit = (params.rstatus === 3) ? 20 : limit;
                let d_sort = (params.rstatus === 3) ? -1 : 1;
                let sort_match = (params.rstatus === 3) ? { date_start_ist: d_sort } : { date_start_ist: d_sort };

                let rStatus = (params.rstatus === 3) ? { "$in": [3, 4] } : params.rstatus;


                let currentDate = currentTimeZoneDate();
                let condition={
                    rstatus: rStatus,
                    "is_active": 1, // Todo: Need to remove dbkey
                    "is_publish": 1, // Todo: Need to remove dbkey
                    date_start_ist: { "$gte": new Date(((currentDate / 1000) - (60 * 60 * 24 * 30)) * 1000) }
                }

                console.log("condition--->>",condition);
                let fbUpPub=await UpcomingFbPubSchema.find(condition,{"match_id":1});

                let matchIdPub=[];
                if(fbUpPub?.length>0){
                    for(let i=0;i<fbUpPub?.length;i++){
                        matchIdPub.push(fbUpPub[i]["match_id"]);
                    }
                }

                console.log("matchIdPubFB-->>",matchIdPub);

                //limit and pagination 
                let football_list = await FbUpcomingsSchema
                // .find({
                //     rstatus: rStatus,
                //     "is_active": 1,
                //     "is_publish": 1,

                // },
                // ).sort(sort_match).skip(startIndex).limit(limit)
                .aggregate([
                    {
                        "$match":{"match_id":{"$in":matchIdPub}}
                    },
                    {"$sort":sort_match},
                    {
                        $lookup: {
                          from: "fb_team_meta_datas",
                          localField: "teama.team_id",
                          foreignField: "team_id",
                          as: "team_meta_a",
                        },
                      },
                      {
                        $unwind: {
                            "path": "$team_meta_a",
                            "preserveNullAndEmptyArrays": true
                        }
                      },
                      {
                        $lookup: {
                          from: "fb_team_meta_datas",
                          localField: "teamb.team_id",
                          foreignField: "team_id",
                          as: "team_meta_b",
                        },
                      },
                      {
                        $unwind: {
                            "path": "$team_meta_b",
                            "preserveNullAndEmptyArrays": true
                        }
                    },
            ]);



                let newFootballList = []
                if(football_list?.length>0){
                    for(let i=0;i<football_list?.length;i++){
                        let item=football_list[i];
                    
                    newFootballList.push(
                        {
                            _id: item._id,
                            match_id: item.match_id,
                            date_start: item.date_start_ist,
                            local_name: item.localTeam.data.name,
                            local_logo_path: (item?.team_meta_a?.logo_url) ? `${env.awsimgurl}profile_doc/${item?.team_meta_a?.logo_url}` : item.teama.logo_url,
                            local_short_name: item.teama.short_name,
                            visit_name: item.visitorTeam.data.name,
                            visit_logo_path: (item?.team_meta_b?.logo_url) ? `${env.awsimgurl}profile_doc/${item?.team_meta_b?.logo_url}` : item.teamb.logo_url,
                            visit_short_name: item.teamb.short_name,
                            league_name: item.league_name,
                            teama_id: item.teama.team_id,
                            teamb_id: item.teamb.team_id,
                            is_playing11: item.is_playing11
                        }
                    )

                    }
                }


                //count 
                let total_count = await UpcomingFbPubSchema.countDocuments(condition)

                newFootballList = sortingData(newFootballList, "date_start", d_sort)

                resolve({
                    total_count: total_count,
                    status_key: params.rstatus,
                    football_list: newFootballList,
                    status: football_list.length > 0 ? true : false,

                })
            } catch (error) {
                resolve({
                    total_count: 0,
                    status_key: params.rstatus,
                    football_list: [],
                    status: false
                });
            }
        })
    },
    player_list_view: async (req) => {
        return new Promise(async (resolve, reject) => {
            try {
                const connection = await connectWithGeneralDb();
                const SettingSchema = createSettingsModel(connection);
                const cktDbConnection = await connectWithCricketDb();
                const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);
                const CktPlayersSchema = createCktPlayersModel(cktDbConnection);

                const footballDbConnection = await connectWithFootballDb();
                const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);
                const FbPlayersSchema=createFbPlayersModel(footballDbConnection);

                const params = req;
                params.match_id = parseInt(params.match_id);
                console.log("params.type===>>", params)
                const user = req.user
                let page = parseInt(req.page || 1)
                let limit = parseInt(req.limit || 10);
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
                            { "$sort": { "pid": -1 } },
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
                                $project: {
                                    "pid": "$pid", "first_name": "$player_detail.first_name",
                                    "fantasy_player_rating": "$player_detail.fantasy_player_rating", "bowling_style": "$player_detail.bowling_style", "batting_style": "$player_detail.batting_style", "playing_role": "$player_detail.playing_role", "selectedBy": "$selectedBy",
                                    "avg_point": "$player_meta_data.avg_point", "logo_url": "$player_meta_data.logo_url", "jersy_no": "$player_meta_data.jersy_no",
                                    "tid": "$tid", "is_playing": "$is_playing", "country": "$player_detail.country",
                                    "player_name":"$player_detail.common_name"
                                }
                            },
                            
                        ]);

                    let isPlys = 1;
                   

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
                            plyObj["season_id"] = matchDetail?.cid;
                            plyObj["team_id"] = matchDetail?.teama?.team_id;
                            plyObj["team_name"] = matchDetail?.teama?.name;
                            plyObj["team_short_name"] = matchDetail?.teama?.short_name;
                            plyListA.push(plyObj)
                        }

                        if (teamBId === playerList[p]["tid"]) {
                            plyObj["season_id"] = matchDetail?.cid;
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

                    let settings = await SettingSchema.findOne({})
                    let timeZoneSet = (req.timezone) ? req.timezone : null;
                    return resolve(response({
                        total_count: playerList.length,
                        cricketplayerdetail: [data],
                        date_start: dateTimeZone(matchDetail.date_start_ist, timeZoneSet),//timeChange(req.user.id,matchDetail.date_start_ist),
                        prize: settings.player_acc,
                        platform_fee: settings.platform_fees,
                    }, playerList.length > 0 ? "Cricket Player list view succesfully.!!!" : "No data found.!!!", true))
                } else if (params.type == "Football") {
                    const FbTeamMetaDatasSchema = createFbTeamMetaDatasModel(footballDbConnection);
                    const FbPlayerDetailsSchema = createFbPlayerDetailsModel(footballDbConnection);

                    let filter = {}
                    //filter["match_id"] = params.match_id;
                    if (params.player_name) {
                        filter = {
                            "player_detail.first_name": new RegExp(params.display_name)
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
                                $match: {"match_id" : params.match_id}
                            },
                            { "$sort": { "pid": -1 } },
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
                            // {
                            //     "$group": {
                            //         "_id": { pid: "$pid" },
                            //         "pid": { "$first": "$pid" }, "first_name": { "$first": "$display_name" }
                            //         , "tid": { "$first": "$tid" }
                            //         , "playing_role": { "$first": "$position_id" }, "is_playing": { "$first": "$is_playing" },
                            //         "logo_url": { "$first": "$image_path" },
                            //         "country": { "$first": "$nationality" }, "season_id": { "$first": "$season_id" },
                            //         "player_name":{ "$first": "$display_name" }

                            //     }
                            // },
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
                                    "pid": "$pid", "first_name": "$player_detail.display_name",
                                    "playing_role": "$player_detail.position_id", "selectedBy": "$selectedBy",
                                    "logo_url": "$player_detail.image_path", "avg_point": "$player_meta.avg_point", 
                                    "meta_logo_url": "$player_meta.logo_url", "jersy_no": "$jersey_number",
                                    "tid": "$tid", "is_playing": "$is_playing", "country": "$player_detail.country_id", "season_id": 5555,
                                    "player_name":"$player_detail.display_name"
                                }
                            },
                            
                        ]);
                        
                        

                    let isPlys = 1;
                    // if (playerList && playerList.length > 0) {

                    // } else {
                    //     let matchA = await FbPlayerDetailsSchema.findOne({ tid: teamAId }, { match_id: 1 })
                    //     let matchB = await FbPlayerDetailsSchema.findOne({ tid: teamBId }, { match_id: 1 })

                    //     isPlys = 0;
                    //     filter["match_id"] = { "$in": [matchA?.match_id, matchB?.match_id] }
                    //     filter["tid"] = { "$in": [teamAId, teamBId] }
                    //     playerList = await FbPlayerDetailsSchema.aggregate(
                    //         [
                    //             {
                    //                 $match: filter
                    //             },
                    //             {
                    //                 "$group": {
                    //                     "_id": { pid: "$pid" },
                    //                     "pid": { "$first": "$pid" }, "first_name": { "$first": "$display_name" }
                    //                     , "tid": { "$first": "$tid" }
                    //                     , "playing_role": { "$first": "$position_id" }, "is_playing": { "$first": "$is_playing" },
                    //                     "logo_url": { "$first": "$image_path" },
                    //                     "country": { "$first": "$nationality" }, "season_id": { "$first": "$season_id" }

                    //                 }
                    //             },
                    //             {
                    //                 $lookup:
                    //                 {
                    //                     from: "fbplymetadatas",
                    //                     localField: "pid",
                    //                     foreignField: "pid",
                    //                     as: "player_detail",
                    //                 },
                    //             },
                    //             {
                    //                 $unwind: {
                    //                     "path": "$player_detail",
                    //                     "preserveNullAndEmptyArrays": true
                    //                 }
                    //             },
                    //             {
                    //                 $project: {
                    //                     "pid": "$pid", "first_name": "$first_name",
                    //                     "playing_role": "$playing_role", "selectedBy": "$selectedBy",
                    //                     "logo_url": "$logo_url",
                    //                     "avg_point": "$player_detail.avg_point", "meta_logo_url": "$player_detail.logo_url", "jersy_no": "$player_detail.jersy_no",
                    //                     "tid": "$tid", "is_playing": "$is_playing", "country": "$country", "season_id": "$season_id"
                    //                 }
                    //             },
                    //             { "$sort": { "pid": -1 } }

                    //         ]);
                    // }

                    let plyListA = [];
                    let plyListB = [];
                    for (let p = 0; p < playerList.length; p++) {

                        let plyObj = {
                            player_id: playerList[p]["pid"],
                            player_name: playerList[p]["first_name"],
                            playing_role: playerList[p]["playing_role"],
                            rating: playerList[p]["rating"],
                            is_playing: (isPlys === 0) ? 2 : playerList[p]["is_playing"],
                            avg_point: playerList[p]["avg_point"],
                            player_image: (playerList?.[p]?.["meta_logo_url"]) ? `${env.awsimgurl}profile_doc/${playerList[p]["meta_logo_url"]}` : `${playerList[p]["logo_url"]}`,
                            jersy_no: playerList[p]["jersy_no"],
                            country: playerList[p]["country"],
                            season_id: matchDetail.season_id
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
                        teama_id: matchDetail?.teama?.team_id,
                        teamb_id: matchDetail?.teamb?.team_id,
                        teama_name: matchDetail?.teama?.name,
                        teama_short_name: matchDetail?.teama?.short_name,
                        teama_logo_url: (teamDetailMetaA && teamDetailMetaA.logo_url) ? `${env.awsimgurl}profile_doc/${teamDetailMetaA.logo_url}` : matchDetail.teama.logo_url,
                        teama_country_name: teamACountry,
                        teama_players: plyListA,
                        teamb_name: matchDetail?.teamb?.name,
                        teamb_short_name: matchDetail?.teamb?.short_name,
                        teamb_logo_url: (teamDetailMetaB && teamDetailMetaB.logo_url) ? `${env.awsimgurl}profile_doc/${teamDetailMetaB.logo_url}` : matchDetail.teamb.logo_url,
                        teamb_country_name: teamBCountry,
                        teamb_players: plyListB,
                        season_id: matchDetail.season_id
                    }


                    let settings = await SettingSchema.findOne({})
                    return resolve(response({
                        total_count: playerList.length,
                        Footballplayerdetail: [data],
                        date_start: matchDetail.date_start_ist,
                        status: playerList.length > 0 ? true : false,
                        prize: settings.player_acc,
                        platform_fee: settings.platform_fees,
                    }, playerList.length > 0 ? "Player list view succesfully.!!!" : "No data found.!!!", true, playerList.length))
                }
            } catch (error) {

                resolve(response({}, "Something went wrong.!!!", false, null, error.stack));
            }
        })
    },
    cricket_list: async (req, res, next) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);

            const params = req.body;
            const user = req.user
            let page = parseInt(req.query.page || 1)
            let limit = parseInt(req.query.limit || 10);
            let startIndex = (page - 1) * limit;
            let endIndex = page * limit;
            let dbkey = keyGen(req.userData.apikey);

            //limit and pagination 
            let cricket_list = await CktLeaguesSchema.find({ status: params.status, ["is_active" + dbkey]: 1, ["is_publish" + dbkey]: 1 }, { cid: 1, date_end: 1, date_start: 1, name: 1, logo_url: 1 }).skip(startIndex).limit(limit).lean();

            cricket_list = cricket_list.map((item) => {
                // _id = item._id
                let checkhttpurl = isValidHttpUrl(item.logo_url)
                if (checkhttpurl) {
                    item.image = item.logo_url
                } else {
                    item.image = `${env.awsimgurl}profile_doc/${item.logo_url}`
                }
                return (item)
            })

            if (cricket_list.length > 0) {
                const CktTeamsSchema = createCktTeamsModel(cktDbConnection);

                dataList = await Promise.all(cricket_list.map(async (item) => {
                    item.series_team_count = await CktTeamsSchema.countDocuments({ cid: item.cid })
                    return item
                }))
            }

            //count 
            let total_count = await CktLeaguesSchema.countDocuments({
                status: params.status, ["is_active" + dbkey]: 1, ["is_publish" + dbkey]: 1,
            })


            let status = cricket_list.length > 0 ? true : false
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

            const params = req.body;
            const user = req.user
            let page = parseInt(req.query.page || 1)
            let limit = parseInt(req.query.limit || 10);
            let startIndex = (page - 1) * limit;
            let endIndex = page * limit;
            let dbkey = keyGen(req.userData.apikey)
            //limit and pagination 
            let football_list = await FbLeaguesSchema.find({
                status: params.status,
                ["is_active" + dbkey]: 1, ["is_publish" + dbkey]: 1,
                // is_current_season: true
            },
                { _id: 1, id: 1, date_start: 1, date_end: 1, logo_path: 1, name: 1, season_id: 1, short_code: 1 }
            ).skip(startIndex).limit(limit).lean();
            football_list = football_list.map((item) => {
                // _id = item._id
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
            let total_count = await FbLeaguesSchema.countDocuments({
                status: params.status, ["is_active" + dbkey]: 1, ["is_publish" + dbkey]: 1,
                //is_current_season: true
            })

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
    // player_detail_view: async (req, res, next) => {
    //     try {
    //         const params = req.body;
    //         const user = req.user
    //         let page = parseInt(req.query.page || 1)
    //         let limit = parseInt(req.query.limit || 10);
    //         let startIndex = (page - 1) * limit;
    //         let endIndex = page * limit;
    //         if (params.type == "Cricket") {
    //             //limit and pagination 
    //             let cricketplayerdetail = await cricketsplayers.find({
    //                 match_id: params.match_id,

    //             }).skip(startIndex).limit(limit);

    //             let data = cricketplayerdetail.map((item) => {

    //                 return (
    //                     {
    //                         _id: item._id,
    //                         match_id: item.match_id,
    //                         teama_id:item.teama.team_id,
    //                         // teama_name: item.teama.team.teama_id,
    //                         // is_playing11: item.is_playing11,

    //                         teama_players: item.teama.players.map((item2, i) => {

    //                             return ({
    //                                 pid: item2.pid,
    //                                 // name: item2.title,
    //                                 // country: item2.country,
    //                                 // playing_role: item2.playing_role,
    //                                 // batting_style: item2.batting_style,
    //                                 // fantasy_player_rating: item2.fantasy_player_rating,
    //                                 // is_playing: item2.is_playing,
    //                                 // avg_point: item2.avg_point
    //                             }

    //                             )

    //                         }),
    //                         // teamb_name: item.teamb.team.title,
    //                         teamb_id:item.teamb.team_id,
    //                         teamb_players: item.teamb.players.map((item3, i) => {

    //                             return ({
    //                                 pid: item3.pid,
    //                                 // name: item3.title,
    //                                 // country: item3.country,
    //                                 // playing_role: item3.playing_role,
    //                                 // batting_style: item3.batting_style,
    //                                 // fantasy_player_rating: item3.fantasy_player_rating,
    //                                 // is_playing: item3.is_playing,
    //                                 // avg_point: item3.avg_point
    //                             }

    //                             )

    //                         })

    //                     }
    //                 )


    //             })
    //             return res.send(response({

    //                 data
    //             }))
    //         }


    //     } catch (error) {
    //         next(error)
    //     }
    // }
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
            const dbName = req.userData.dbName;
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
            const dbName = req.userData.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const JoinAccPlayersSchema = createJoinAccPlayersModel(vendorDbConnection);

            let body_detail = req.body;
            await body_detail.data.map(async (item) => {
                let send_array = { match_id: body_detail.match_id, userid: req.user.id, pid: item.pid, gkamount: item.gkamount, sharecnt: item.sharecnt, gametype: body_detail.gametype, gamekey: body_detail.gamekey }
                await JoinAccPlayersSchema.create(send_array);
                return 'sucess'
            })
            return res.send(response({}, "Add Player Accumulator Successfully!.", true));
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    prize_pool_list: async (req, res, next) => {
        try {
            const params = req.body;
            let page = parseInt(req.query.page || 1)
            let limit = parseInt(req.query.limit || 10);
            let startIndex = (page - 1) * limit;
            let endIndex = page * limit;

            if (params.type == "Cricket") {
                const cktDbConnection = await connectWithCricketDb();
                const CktTeamsSchema = createCktTeamsModel(cktDbConnection);
                const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);

                const cktname = await CktLeaguesSchema.findOne({ cid: params.league_id })

                let checkhttpurl = isValidHttpUrl(cktname.logo_url)
                if (checkhttpurl) {
                    cktname.logo_url = cktname.logo_url
                } else {
                    cktname.logo_url = `${env.awsimgurl}profile_doc/${cktname.logo_url}`
                }
                let series_logo_url = cktname.logo_url

                letSendTeamData = {
                    title: cktname.name,
                    logo_url: series_logo_url,
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
                        price: 50
                    })
                })
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
                    // header_name: data2_detail,
                    team_list: data,
                    platform_fee: 5
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
                // const fbname = await fbleagues.find({
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
                        price: 50,
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
                    platform_fee: 5
                }, footballteam_list.length > 0 ? "Pool list view succesfully.!!!" : "No data found.!!!", true))
            }
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    team_list: async (req, res, next) => {
        try {
            const params = req.body;
            let page = parseInt(req.query.page || 1)
            let limit = parseInt(req.query.limit || 10);
            let startIndex = (page - 1) * limit;
            let endIndex = page * limit;
            letSendTeamData = {}

            if (params.type == "Cricket") {
                const cktDbConnection = await connectWithCricketDb();
                const CktTeamsSchema = createCktTeamsModel(cktDbConnection);
                const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);

                const cktname = await CktLeaguesSchema.findOne({ cid: params.league_id })

                let checkhttpurl = isValidHttpUrl(cktname.logo_url)
                if (checkhttpurl) {
                    cktname.logo_url = cktname.logo_url
                } else {
                    cktname.logo_url = `${env.awsimgurl}profile_doc/${cktname.logo_url}`
                }
                let series_logo_url = cktname.logo_url

                letSendTeamData = {
                    title: cktname.name,
                    logo_url: series_logo_url,
                    date_start: cktname.date_start
                }
                // let data2 = cktname.map((item2, i) => {
                //     return ({
                //         name: item2.name,
                //         date_start: item2.date_start,
                //         logo_url: item2?.logo_url
                //     })
                // })
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
                        price: 50
                    })
                }
                )
                // })
                // count 
                let total_count = await CktTeamsSchema.countDocuments({ cid: params.league_id })
                //let status = cricketteam_list.length > 0 ? true : false

                let data2_detail = "";
                // if (data2.length > 0) {
                //     data2_detail = data2[0].name
                //     // data2_detail = data2[0].date_start
                // }
                if (total_count > 4) {
                    return res.send(response({
                        total_count: total_count,
                        // title: cktname.name,
                        // date_start: cktname.date_start,
                        // logo_url: series_logo_url,
                        matchDetail: letSendTeamData,
                        team_list: data,
                        platform_fee: 5
                    }, cricketteam_list.length > 0 ? "Team list view succesfully.!!!" : "No data found.!!!", true))
                } else {

                    return res.status(401).send(response({}, `Not sufficient Count.`, false))
                    // return res.status(402).send({ message: "Not sufficient Count" ,flase})
                }
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
                // const fbname = await fbleagues.find({
                //     season_id: params.league_id
                // })

                // let data2 = fbname.map((item2, i) => {
                //     return ({
                //         name: item2.name
                //     })
                // })
                const footballteam_list = await FbTeamsSchema.find({
                    season_id: params.league_id
                }).lean();
                // .skip(startIndex).limit(limit)

                let data = footballteam_list.map((item) => {
                    return ({
                        _id: item._id,
                        league_id: item.season_id,
                        team_id: item.team_id,
                        team_name: item.name,
                        team_short_name: item.short_code,
                        team_logo_url: item.logo_path,
                        price: 50,
                        team_country_name: "",
                    })
                })

                let total_count = await FbTeamsSchema.countDocuments({ season_id: params.league_id })
                // let status = footballteam_list.length > 0 ? true : false
                // let data2_detail = "";
                // if (data2.length > 0) {
                //     data2_detail = data2[0].name
                // }
                if (total_count > 4) {
                    return res.send(response({
                        total_count: total_count,
                        // header_name: data2_detail,
                        matchDetail: letSendTeamData,
                        team_list: data,
                        platform_fee: 5
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
        try {
            const cktDbConnection = await connectWithCricketDb();
            const CricketPlayersSchema = createCricketPlayersModel(cktDbConnection);

            const footballDbConnection = await connectWithFootballDb();
            const FbPlayersSchema = createFbPlayersModel(footballDbConnection);

            const dbName = req.userData.dbName;
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
            if (params.type == "Cricket") {
                userplymMain = UserPlayerMatchCktsSchema;
                userteamMain = UserTeamCktSchema;
                typeName = "Cricket";
                let cktPlayer = await CricketPlayersSchema.findOne({ "match_id": params.match_id })
                // let SendPlayerData = {}
                let teama_players = await cktPlayer.teama.players.map((item3, i) => {
                    SendPlayerData[item3.pid] = {
                        playing_role: item3.playing_role,
                        country: item3.country,
                        team_id: cktPlayer.teama.team_id
                    }
                })

                let teamb_players = await cktPlayer.teamb.players.map((item2, i) => {
                    SendPlayerData[item2.pid] = {
                        playing_role: item2.playing_role,
                        country: item2.country,
                        team_id: cktPlayer.teamb.team_id
                    }
                })

            } else if (params.type == "Football") {
                userplymMain = UserPlayerMatchFbsSchema;
                userteamMain = UserTeamFbSchema;
                typeName = "Football";

                let fbplayer = await FbPlayersSchema.findOne({ "match_id": params.match_id })

                let teama_players = await fbplayer.teama.squad.data.map((item3, i) => {
                    SendPlayerData[item3.player_id] = {
                        playing_role: item3.position_id,
                        // country: item3.nationality,
                        team_id: fbplayer.teama.team_id
                    }
                }

                )
                let teamb_players = await fbplayer.teamb.squad.data.map((item2, i) => {
                    SendPlayerData[item2.player_id] = {
                        playing_role: item2.position_id,
                        // country: item2.nationality,
                        team_id: fbplayer.teamb.team_id
                    }
                })

            }


            params.userid = req.user.id


            // params.pid = pid
            let array = params.pid
            let uniqueArray = Array.from(new Set(array));
            let lengthPlayers = uniqueArray.length;
            if (lengthPlayers == settingDetail.matchPlyCount) {
                //let oldpalyerdata = await userplymckt.distinct("pid", { match_id: params.match_id,userid:req.user.id })
                let oldpalyerdata = await userplymMain.aggregate([
                    {
                        $match: { match_id: params.match_id, userid: req.user.id }
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
                    let playerteam = await userteamMain.create(params);

                    let uteamid = playerteam._id
                    params.uteamid = uteamid

                    await params.pid.forEach(async (item) => {
                        let createData = {
                            pid: item,
                            match_id: params.match_id,
                            uteamid: ObjectID(params.uteamid),
                            userid: req.user.id,
                            playing_role: SendPlayerData?.[item]?.["playing_role"],
                            mteam_id: SendPlayerData?.[item]?.["team_id"],
                            teama_count: params.teama_count,
                            teamb_count: params.teamb_count,
                            team_no: params.team_no
                        }
                        let userplymcktSave = await userplymMain.create(createData);

                    })
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
                const CktTeamsSchema = createCktTeamsModel(cktDbConnection);
                const CktPlayerStatesSchema = createCktPlayerStatesModel(cktDbConnection);
                const CktPlayersFantasyPointsSchema = createCktPlayersFantasyPointsModel(cktDbConnection);
                const CktPlayersSchema = createCktPlayersModel(cktDbConnection);

                //cricket
                let cktplydata = {}
                let teamdata = {}
                // let cricketplayersdetail = await cricketsplayers.findOne(
                //     { "teama.players": { "$elemMatch": { "pid": params.player_id } } }, { "teama.players.$": 1, "teama.team": 1 }
                // )
                let crktplydetail = await CktPlayersSchema.findOne(
                    { pid: params.player_id }
                )

                if (!crktplydetail) {
                    return res.send(response({}, "player is not find", false));
                }
                let crktTeam = await CktTeamsSchema.findOne(
                    { team_id: crktplydetail.tid }
                )

                let newplydat = {
                    team_id: crktTeam.team_id,
                    team_name: crktTeam.team.title,
                    team_short_name: crktTeam.team.abbr,
                    team_logo_url: crktTeam.team.thumb_url,
                    player_id: crktplydetail.pid,
                    player_name: crktplydetail.title,
                    country: crktplydetail.country,
                    playing_role: crktplydetail.playing_role,
                    batting_style: crktplydetail.batting_style,
                    rating: crktplydetail.fantasy_player_rating,
                    dob: crktplydetail.birthdate,
                    bowling_style: crktplydetail.bowling_style,
                    player_image: "",
                    avg_point: ""
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
                    { $project: { "date_start_ist": "$upcom.date_start_ist", "name": "$upcom.short_title", "name": "$upcom.short_title", "points": "$tp" } }

                ])



                let player_state = [];

                let player_states = await CktPlayerStatesSchema.findOne({ pid: params.player_id }, { batting: 1, bowling: 1, _id: -1 })
                let player_states_list = []
                if (player_states) {
                    player_state.push({ batting: player_states.batting }, { bowling: player_states.bowling })
                    let batting = player_state[0].batting;
                    let bowling = player_state[1].bowling;
                    for (let i in batting) {
                        let batting_detail = []
                        let bowling_detail = []
                        for (let j in batting[i]) {
                            batting_detail.push({ key: j, value: batting[i][j] })
                        }

                        for (let j in bowling[i]) {
                            bowling_detail.push({ key: j, value: bowling[i][j] })
                        }

                        player_states_list.push({ tabTitle: i, summaryList: [{ title: "Batting Summary", pointsList: batting_detail }, { title: "Bowling Summary", pointsList: bowling_detail }] })
                    }
                }

                let playe_detail = { player_detail: newplydat, player_performance_list: player_performance_list, player_states_list: player_states_list }
                return res.send(response(playe_detail, "player detail find successfully", true));

            } else if (params.type == "fb") {
                const footballDbConnection = await connectWithFootballDb();
                const FbPlayerDetailsSchema = createFbPlayerDetailsModel(footballDbConnection);
                const FbPlayerFantasyPointsSchema = createFbPlayerFantasyPointsModel(footballDbConnection)
                const FbPlayerStatisticsDetailSchema = createFbPlayerStatisticsDetailModel(footballDbConnection);
                const FbTeamsSchema = createFbTeamsModel(footballDbConnection);


                //football
                let plyData = {};
                let fbteamdata = {};
                //let fbplayersdetail = await fbplayers.findOne({ "teama.squad.data": { "$elemMatch": { "player_id": params.player_id } } }, { "teama.squad.data.$": 1, "teama.team": 1 })
                let fbplayersdetail = await FbPlayerDetailsSchema.findOne({ pid: params.player_id })
                if (!fbplayersdetail) {
                    return res.send(response({}, "player is not find", false));
                }

                let fbTeam = await FbTeamsSchema.findOne(
                    { team_id: fbplayersdetail.tid }
                )
                // plyData = (fbplayersdetail && fbplayersdetail["teama"]["squad"]["data"][0]) ? fbplayersdetail["teama"]["squad"]["data"][0] : {};
                // fbteamdata = (fbplayersdetail && fbplayersdetail["teama"]["team"]) ? fbplayersdetail["teama"]["team"] : {};
                // // if (!plyData["player_id"]) {
                // //     let fbplayersdetail11 = await fbplayers.findOne({ "teamb.squad.data": { "$elemMatch": { "player_id": params.player_id } } }, { "teamb.squad.data.$": 1, "teamb.team": 1 })

                // //     plyData = (fbplayersdetail11 && fbplayersdetail11["teamb"]["squad"]["data"][0]) ? fbplayersdetail11["teamb"]["squad"]["data"][0] : {};
                // //     fbteamdata = (fbplayersdetail11 && fbplayersdetail11["teamb"]["team"]) ? fbplayersdetail11["teamb"]["team"] : {};

                // // }


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

                let player_performance_list = await FbPlayerFantasyPointsSchema.aggregate([
                    {
                        "$match": {
                            "pid": params.player_id
                        }
                    },
                    {
                        "$lookup": {
                            from: "fb_upcomings",
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
                    { $project: { "date_start_ist": "$upcom.date_start_ist", "name": { $concat: ["$upcom.teama.name", " v/s ", "$upcom.teamb.name"] }, "points": "$tp" } }

                ])

                let player_statistics = await FbPlayerStatisticsDetailSchema.findOne({ player_id: params.player_id })

                let playe_detail = {
                    player_detail: newplydat,
                    performance_detail: player_performance_list,
                    player_statistics: player_statistics
                }

                return res.send(response(playe_detail, "player detail find successfully", true));

                //return res.send(response({}, "player is not find", false));

            }

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    series_player_detail: async (req, res, next) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const CktTeamsSchema = createCktTeamsModel(cktDbConnection);

            const footballDbConnection = await connectWithFootballDb();
            const FbTeamsSchema = createFbTeamsModel(footballDbConnection);
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
            let cricketplayersdetail = await CktTeamsSchema.findOne({ "players": { "$elemMatch": { "pid": params.player_id } } }, { "players": 1 })

            cktplydata = (cricketplayersdetail && cricketplayersdetail["players"][0]) ? cricketplayersdetail["players"][0] : {};
            // "players":  { "pid": params.player_id }  }, { "players": 1 })
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
                    "image_path": cktplydata.thumb_url,
                    "is_playing": cktplydata.is_playing
                }

                return res.send(response(newplydat, "player detail find successfully", true));

            }

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

            const footballDbConnection = await connectWithFootballDb();
            const FbPlayerDetailsSchema = createFbPlayerDetailsModel(footballDbConnection);

            const dbName = req.userData.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UserPlayersCktSchema = createUserPlayersCktModel(vendorDbConnection);
            const UserPlayersFbSchema = createUserPlayersFbModel(vendorDbConnection);
            const UserCktLeagueSchema = createUserCktLeagueModel(vendorDbConnection);
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
                userteamMain = UserCktLeagueSchema;
                typeName = "Cricket";
                let cktPlayer = await CktPlayersSchema.aggregate([{ "$match": { "league_id": params.league_id } },
                {
                    "$group":
                    {
                        _id: "$pid", "pid": { $first: "$pid" }, "playing_role": { $first: "$playing_role" }, "team_id": { $first: "$tid" }, "country": { $first: "$country" }
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

    substitue_add_series_player: async (req, res, next) => {
        try {
            const params = req.body;
            const user = req.user
            params.userid = req.user.id;

            const dbName = req.userData.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UserPlayersCktSchema = createUserPlayersCktModel(vendorDbConnection);
            const UserPlayersFbSchema = createUserPlayersFbModel(vendorDbConnection);

            if (params.type == "Cricket") {
                const cktDbConnection = await connectWithCricketDb();
                const CktPlayersSchema = createCktPlayersModel(cktDbConnection);

                //limit and pagination 
                //params.userid = req.user.id
                //let playerteam = await userteamsckt.create(params);
                // let uteamid = playerteam._id
                // params.uteamid = uteamid
                // params.pid = pid
                let array = params.pid
                let uniqueArray = Array.from(new Set(array));
                let lengthPlayers = uniqueArray.length;

                let plyList = await CktPlayersSchema.find({ "pid": { "$in": params.pid } })
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

                        for (let i = 0; i < params.pid.length; i++) {

                            let createData = {
                                pid: params.pid[i],
                                league_id: params.league_id,
                                uteamid: params.uteamid,
                                is_substitue: params.is_substitue,
                                team_count: params.team_count,
                                team_no: params.team_no,
                                userid: params.userid,
                                mteam_id: plyObj[params.pid[i]]["tid"],
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

                    let fbPlayerList = await FbPlayerDetailsSchema.find({ "season_id": params.league_id, "pid": { "$in": params.pid } },
                        {
                            "pid": 1, "position_id": 1, "tid": 1
                        });

                    let SendPlayerData = {};
                    let team_players = await fbPlayerList && fbPlayerList.map((item3, i) => {
                        SendPlayerData[item3.pid] = {
                            playing_role: item3?.position_id,
                            team_id: item3?.tid,
                        }

                    })

                    if (!checkPlyDup) {
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
            const user = req.user
            let page = parseInt(req.query.page || 1)
            let limit = parseInt(req.query.limit || 10);
            let startIndex = (page - 1) * limit;
            let endIndex = page * limit;

            if (params.type == "Cricket") {
                const cktDbConnection = await connectWithCricketDb();
                const CktTeamsSchema = createCktTeamsModel(cktDbConnection);
                const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);
                const CktPlayersSchema = createCktPlayersModel(cktDbConnection);

                let player_list = [];
                //limit and pagination 
                let cktleag_name = await CktLeaguesSchema.findOne({ "cid": params.league_id })
                let series_name = cktleag_name?.name
                let series_date_start = cktleag_name?.date_start
                let checkhttpurl = isValidHttpUrl(cktleag_name.logo_url)
                if (checkhttpurl) {
                    cktleag_name.logo_url = cktleag_name.logo_url
                } else {
                    cktleag_name.logo_url = `${env.awsimgurl}profile_doc/${cktleag_name.logo_url}`
                }
                let series_logo = cktleag_name.logo_url
                // let player= await cktteam
                // let playerdetail = await cricketsplayers.aggregate([
                //     {
                //         $match: { "teama.cid": params.league_id }
                //     },
                //     { $project: { teama: 1, teamb: 1 } },
                //     { $project: { warehouses: { $objectToArray: "$$ROOT" } } },
                //     { $unwind: "$warehouses" },
                //     { $group: { _id: "$warehouses.v.team_id", players: { "$first": "$warehouses.v.players" }, team: { "$first": "$warehouses.v.team" } } },
                // ])

                let teamList = await CktTeamsSchema.find({
                    "cid": params.league_id
                }, { "team_id": 1, "team": 1 })
                let teamObj = {};
                let teamIds = [];
                teamList.forEach((itemTm) => {
                    teamObj[itemTm.team_id] = itemTm;
                    teamIds.push(itemTm.team_id);
                })

                let playerList = await CktPlayersSchema.aggregate(
                    [
                        { "$match": { "league_id": params.league_id } },
                        {
                            "$group": {
                                "_id": { pid: "$pid" }, "pid": { "$first": "$pid" }, "first_name": { "$first": "$first_name" }
                                , "tid": { "$first": "$tid" }, "fantasy_player_rating": { "$first": "$fantasy_player_rating" }, "bowling_style": { "$first": "$bowling_style" }
                                , "batting_style": { "$first": "$batting_style" }, "playing_role": { "$first": "$playing_role" }, "is_playing": { "$first": "$is_playing" }, "pid": { "$first": "$pid" }

                            }
                        }
                    ]);



                let otherLegPly = 0;
                if (playerList && playerList.length > 0) {
                    playerList.forEach((itemPly) => {
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
                            player_image: "",
                        })
                    })
                } else {
                    let plyOfOtherLegList = await CktPlayersSchema.aggregate(
                        [
                            { "$match": { tid: { "$in": teamIds } } },
                            {
                                "$group": {
                                    "_id": { pid: "$pid" }, "pid": { "$first": "$pid" }, "first_name": { "$first": "$first_name" }
                                    , "tid": { "$first": "$tid" }, "fantasy_player_rating": { "$first": "$fantasy_player_rating" }, "bowling_style": { "$first": "$bowling_style" }
                                    , "batting_style": { "$first": "$batting_style" }, "playing_role": { "$first": "$playing_role" }, "is_playing": { "$first": "$is_playing" }, "pid": { "$first": "$pid" }

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
                                player_image: "",
                            })
                        })

                    }



                }
                //count 

                // data.series_name = series_name
                // data.series_logo = cktleag_name.logo_url
                let total_count = await CktTeamsSchema.countDocuments({ "cid": params.league_id })


                // let total_count = await cricketsplayers.find({ match_id: params.match_id }).count({})
                //let status = player_list.length > 0 ? true : false

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
                const FbPlayerDetailsSchema = createFbPlayerDetailsModel(footballDbConnection);
                const FbLeaguesSchema = createFbLeaguesModel(footballDbConnection);
                const FbTeamsSchema = createFbTeamsModel(footballDbConnection);

                let fbleague_name = await FbLeaguesSchema.findOne({ "season_id": params.league_id })
                let series_name = fbleague_name?.name
                let series_date_start = fbleague_name?.date_start
                let checkhttpurl = isValidHttpUrl(fbleague_name.logo_path)
                if (checkhttpurl) {
                    fbleague_name.logo_path = fbleague_name.logo_path
                } else {
                    fbleague_name.logo_path = `${env.awsimgurl}profile_doc/${fbleague_name.logo_path}`
                }
                let series_logo = fbleague_name.logo_path
                // let series_logo = ""
                // let player_deatail = await fbteams.find({
                //     "season_id"
                //         : params.league_id
                // })
                let player_deatail = await FbPlayerDetailsSchema.aggregate([{ "$match": { "season_id": params.league_id } },
                {
                    "$group":
                    {
                        _id: "$pid", "pid": { $first: "$pid" }, "position_id": { $first: "$position_id" }, "tid": { $first: "$tid" },
                        "fullname": { $first: "$fullname" }, "image_path": { $first: "$image_path" }
                    }
                }
                ])

                let teamObj = {};
                let teamDetail = await FbTeamsSchema.find({
                    "season_id"
                        : params.league_id
                }, { "team_id": 1, "name": 1, "short_code": 1, "logo_path": 1 })
                teamDetail.forEach(itemTm => {
                    teamObj[itemTm.team_id] = itemTm;
                })

                let player_list = [];
                let no_Team_Ply_list = {};
                player_deatail && player_deatail.map(async (itemPly) => {


                    // await itemTeams?.squad?.data.map((item, i) => {
                    //if (item.player && item.player.data && item.player.data.team_id) {

                    if (teamObj && teamObj[itemPly.tid]) {
                        player_list.push({
                            team_id: teamObj[itemPly.tid]["team_id"],
                            team_name: teamObj[itemPly.tid]["name"],
                            team_short_name: teamObj[itemPly.tid]["short_code"],
                            team_logo_url: teamObj[itemPly.tid]["logo_path"],
                            player_id: itemPly.pid,
                            player_name: itemPly.fullname,
                            rating: "", //itemPly.rating,
                            playing_role: itemPly.position_id,
                            // is_playing: item.is_playing,
                            avg_point: "",
                            player_image: itemPly.image_path,
                        })
                    } else {
                        no_Team_Ply_list[itemPly.tid] = 1;
                    }
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
                })

                let total_count = await FbTeamsSchema.countDocuments({ "season_id": params.league_id })
                return res.send(response({
                    // player_deatail,
                    series_name,
                    series_logo,
                    series_date_start,
                    player_list,
                    // player_deatail,
                    total_count: total_count
                },
                    player_deatail.length > 0 ? "Cricket Player list view succesfully.!!!" : "No data found.!!!", true
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
            const cktDbConnection = await connectWithCricketDb();
            const CricketPlayersSchema = createCricketPlayersModel(cktDbConnection);

            const dbName = req.userData.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const JoinMatchContestsSchema = createJoinMatchContestsModel(vendorDbConnection);
            const UserPlayerMatchCktsSchema = createUserPlayerMatchCktsModel(vendorDbConnection);
            const UserTeamCktSchema = createUserTeamCktModel(vendorDbConnection);

            const params = req.body
            let cktPlayer = await CricketPlayersSchema.findOne({ "match_id": params.match_id })
            // let teama_id = cktPlayer.teama.team.tid

            // let teamb_id = cktPlayer.teamb.team.tid;
            let userid = req.user.id;
            let dbkey = keyGen(req.userData.apikey);
            let usrPlayer = await UserPlayerMatchCktsSchema.aggregate([
                {
                    "$match": { "match_id": params.match_id }
                },
                {
                    $lookup:
                    {
                        from: "user_team_ckt",
                        localField: "uteamid",
                        foreignField: "_id",
                        as: "teamdetail",
                        pipeline: [
                            {
                                $match:
                                {
                                    "userid": req.user.id
                                },
                            },
                        ]
                    }
                },
                {
                    "$unwind": "$teamdetail"
                },
            ])

            // let userplaymckt_count = await userplymckt.aggregate([
            //     { $match: { match_id: params.match_id, userid:userid } },
            //     {
            //         $group: { "_id": { "match_id": "$match_id", "mteam_id": "$mteam_id", "uteamid": "$uteamid" }, count: { $sum: 1 } }
            //     }])


            let counta = 0;
            let countb = 0;

            var teamObj = {};
            let players_id = []
            usrPlayer.forEach(async (item) => {

                // userplaymckt_count.map((item5, i) => {

                //     var mteam_id = item5?._id.mteam_id
                //     if (teama_id == mteam_id ) {
                //         counta = item5?.count
                //     } else if (teamb_id == mteam_id) {
                //         countb = item5?.count
                //     }
                // })


                //let teamDetail=userplaymckt_count.filter(x=>x.uteam_id==item.uteamid)

                let batCntA = cktPlayer.teama.players.filter(x => x.pid == item.pid);
                let batCntB = cktPlayer.teamb.players.filter(x => x.pid == item.pid);

                let cntBat = 0, cntBowl = 0, cntWk = 0, cntAll = 0;
                cntBat = (teamObj[item.uteamid] && teamObj[item.uteamid]["bat"]) ? teamObj[item.uteamid]["bat"] : 0;
                cntBowl = (teamObj[item.uteamid] && teamObj[item.uteamid]["bowl"]) ? teamObj[item.uteamid]["bowl"] : 0;
                cntWk = (teamObj[item.uteamid] && teamObj[item.uteamid]["wk"]) ? teamObj[item.uteamid]["wk"] : 0;
                cntAll = (teamObj[item.uteamid] && teamObj[item.uteamid]["all"]) ? teamObj[item.uteamid]["all"] : 0;

                if (batCntA && batCntA.length > 0) {
                    batCntA = batCntA[0];
                    players_id.push(batCntA.pid);

                    let allType = { "bat": 0, "bowl": 0, "wk": 0, "all": 0 }
                    allType["bat"] = (batCntA.playing_role == "bat") ? ++cntBat : cntBat;
                    allType["bowl"] = (batCntA.playing_role == "bowl") ? ++cntBowl : cntBowl;
                    allType["wk"] = (batCntA.playing_role == "wk") ? ++cntWk : cntWk;
                    allType["all"] = (batCntA.playing_role == "all") ? ++cntAll : cntAll;

                    allType["uteamid"] = item.uteamid;
                    allType["teama"] = cktPlayer.teama.team.abbr;
                    allType["teamb"] = cktPlayer.teamb.team.abbr;
                    allType["logo_url_teama"] = cktPlayer.teama.team.logo_url;
                    allType["logo_url_teamb"] = cktPlayer.teamb.team.thumb_url;
                    allType["teama_count"] = item.teama_count;
                    allType["teamb_count"] = item.teamb_count;
                    allType["team_no"] = item.team_no;


                    // allType["players_id"] = players_id

                    teamObj[item.uteamid] = allType;

                }
                if (batCntB && batCntB.length > 0) {
                    batCntB = batCntB[0];
                    players_id.push(batCntB.pid);

                    let allType = { "bat": 0, "bowl": 0, "wk": 0, "all": 0 }
                    allType["bat"] = (batCntB.playing_role == "bat") ? ++cntBat : cntBat;
                    allType["bowl"] = (batCntB.playing_role == "bowl") ? ++cntBowl : cntBowl;
                    allType["wk"] = (batCntB.playing_role == "wk") ? ++cntWk : cntWk;
                    allType["all"] = (batCntB.playing_role == "all") ? ++cntAll : cntAll;
                    allType["uteamid"] = item.uteamid;
                    allType["teama"] = cktPlayer.teama.team.abbr;
                    allType["teamb"] = cktPlayer.teamb.team.abbr;
                    allType["logo_url_teama"] = cktPlayer.teama.team.logo_url;
                    allType["logo_url_teamb"] = cktPlayer.teamb.team.thumb_url;
                    allType["teama_count"] = counta;
                    allType["teamb_count"] = countb;
                    // allType["players_id"] = players_id;
                    allType["teama_count"] = item.teama_count;
                    allType["teamb_count"] = item.teamb_count;
                    allType["team_no"] = item.team_no;

                    teamObj[item.uteamid] = allType;
                }
                // let myUsrTeam = await userteamckt.countDocuments({
                //     match_id: params.match_id,
                //     userid: 1
                // })

                // let joinContestCount = await joinMContSchema.countDocuments({
                //     match_id: params.match_id,
                //     userid: 1,
                //     // uteamid: item.uteamid
                // })

                // teamObj["mypics"] = myUsrTeam;
                // teamObj["contestCount"] = joinContestCount;
            })
            let myUsrTeam = await UserTeamCktSchema.countDocuments({
                match_id: params.match_id,
                userid: req.user.id
            })
            let joinContestCount = await JoinMatchContestsSchema.countDocuments({
                match_id: params.match_id,
                userid: req.user.id
                // uteamid: item.uteamid
            })
            // teamObj["mypicks"] = myUsrTeam;
            // teamObj["contestCount"] = joinContestCount;


            teamObj = (teamObj) ? Object.values(teamObj) : [];
            // return res.send(response(teamObj, teamObj.length > 0 ? "Your team list" : "You have not created any team of players", true));
            return res.send({ status: true, data: teamObj, mypicks: myUsrTeam, contestCount: joinContestCount, message: teamObj.length > 0 ? "Your team list" : "You have not created any team of players" });
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    team_list_user_fb: async (req, res, next) => {
        try {
            const params = req.body
            let dbkey = keyGen(req.userData.apikey);

            const footballDbConnection = await connectWithFootballDb();
            const FbPlayersSchema = createFbPlayersModel(footballDbConnection);

            const dbName = req.userData.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const JoinMatchContestsSchema = createJoinMatchContestsModel(vendorDbConnection);
            const UserPlayerMatchFbsSchema = createUserPlayerMatchFbsModel(vendorDbConnection);
            const UserTeamFbSchema = createUserTeamFbModel(vendorDbConnection);

            const Fbplayer = await FbPlayersSchema.findOne({ match_id: params.match_id })

            let usrPlayer = await UserPlayerMatchFbsSchema.aggregate([
                {
                    "$match": { "match_id": params.match_id }
                },
                {
                    $lookup:
                    {
                        from: "userteamfbs" + dbkey,
                        localField: "uteamid",
                        foreignField: "_id",
                        as: "teamdetail",
                        pipeline: [
                            {
                                $match:
                                {
                                    "userid": req.user.id
                                },
                            },
                        ]
                    }
                },
                {
                    "$unwind": "$teamdetail"
                },
            ]
            )

            let teamObj = {};
            let players_id = []
            usrPlayer.forEach((item) => {

                let batCntA = Fbplayer.teama.squad.data.filter(x => x.player_id == item.pid);
                let batCntB = Fbplayer.teamb.squad.data.filter(x => x.player_id == item.pid);
                let cntGK = 0, cntDEF = 0, cntMID = 0, cntFWD = 0;
                cntGK = (teamObj[item.uteamid] && teamObj[item.uteamid]["GK"]) ? teamObj[item.uteamid]["GK"] : 0;
                cntDEF = (teamObj[item.uteamid] && teamObj[item.uteamid]["DEF"]) ? teamObj[item.uteamid]["DEF"] : 0;
                cntMID = (teamObj[item.uteamid] && teamObj[item.uteamid]["MID"]) ? teamObj[item.uteamid]["MID"] : 0;
                cntFWD = (teamObj[item.uteamid] && teamObj[item.uteamid]["FWD"]) ? teamObj[item.uteamid]["FWD"] : 0;
                if (batCntA && batCntA.length > 0) {
                    batCntA = batCntA[0];
                    players_id.push(batCntA.player_id);
                    let allType = { "GK": 0, "DEF": 0, "MID": 0, "FWD": 0 }
                    allType["GK"] = (batCntA.position_id == 1) ? ++cntGK : cntGK;
                    allType["DEF"] = (batCntA.position_id == 2) ? ++cntDEF : cntDEF;
                    allType["MID"] = (batCntA.position_id == 3) ? ++cntMID : cntMID;
                    allType["FWD"] = (batCntA.position_id == 4) ? ++cntFWD : cntFWD;

                    // let allType = {}
                    allType["uteamid"] = item.uteamid;
                    allType["teama"] = Fbplayer.teama.team?.title;
                    allType["teamb"] = Fbplayer.teamb.team?.title;
                    allType["logo_url_teama"] = Fbplayer.teama.team.logo_url;
                    allType["logo_url_teamb"] = Fbplayer.teamb.team.logo_url;
                    allType["teama_count"] = item.teama_count;
                    allType["teamb_count"] = item.teamb_count;
                    allType["team_no"] = item.team_no;

                    // allType["players_id"] = players_id

                    teamObj[item.uteamid] = allType;
                }
                if (batCntB && batCntB.length > 0) {
                    batCntB = batCntB[0];
                    players_id.push(batCntB.player_id);
                    let allType = { "GK": 0, "DEF": 0, "MID": 0, "FWD": 0 }
                    allType["GK"] = (batCntB.position_id == 1) ? ++cntGK : cntGK;
                    allType["DEF"] = (batCntB.position_id == 2) ? ++cntDEF : cntDEF;
                    allType["MID"] = (batCntB.position_id == 3) ? ++cntMID : cntMID;
                    allType["FWD"] = (batCntB.position_id == 4) ? ++cntFWD : cntFWD;

                    // let allType = {}
                    allType["uteamid"] = item.uteamid;
                    allType["teama"] = Fbplayer.teama.team?.title;
                    allType["teamb"] = Fbplayer.teamb.team?.title;
                    allType["logo_url_teama"] = Fbplayer.teama.team.logo_url;
                    allType["logo_url_teamb"] = Fbplayer.teamb.team.logo_url;
                    allType["teama_count"] = item.teama_count;
                    allType["teamb_count"] = item.teamb_count;
                    allType["team_no"] = item.team_no;
                    // allType["players_id"] = players_id;
                    teamObj[item.uteamid] = allType;
                }
            })
            let myUsrTeam = await UserTeamFbSchema.countDocuments({
                match_id: params.match_id,
                userid: req.user.id
            })

            let joinContestCount = await JoinMatchContestsSchema.countDocuments({
                match_id: params.match_id,
                userid: req.user.id
                // uteamid: item.uteamid
            })

            // teamObj = (teamObj) ? Object.values(teamObj) : [];
            // return res.send(response(teamObj, teamObj.length > 0 ? "Your team list" : "You have not created any team of players", (teamObj.length > 0) ? true : false));
            teamObj = (teamObj) ? Object.values(teamObj) : [];
            // return res.send(response(teamObj, teamObj.length > 0 ? "Your team list" : "You have not created any team of players", true));

            return res.send({ status: true, data: teamObj, mypicks: myUsrTeam, contestCount: joinContestCount, message: teamObj.length > 0 ? "Your team list" : "You have not created any team of players" });
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },

    team_series_list_ckt: async (req, res, next) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const CktTeamsSchema = createCktTeamsModel(cktDbConnection);
            const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);
            const CricketPlayersSchema = createCricketPlayersModel(cktDbConnection);

            const dbName = req.userData.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const JoinContestsSchema = createSeriesJoinContestsModel(vendorDbConnection);
            const UserPlayersCktSchema = createUserPlayersCktModel(vendorDbConnection);
            const UserCktLeagueSchema = createUserCktLeagueModel(vendorDbConnection);

            const params = req.body;
            params.userid = req.user.id;
            let dbkey = keyGen(reqdb);
            let teamObj = {};
            let cktLDetail = await CktLeaguesSchema.findOne({ "cid": params.league_id })

            let cktPlayer = await CricketPlayersSchema.findOne({ "teama.cid": params.league_id })
            let cktplayers = await CktTeamsSchema.find({ cid: params.league_id })

            //Todo: Not using
            let usrPlayer = await UserPlayersCktSchema.aggregate([
                {
                    "$match": { "league_id": params.league_id }
                },
                {
                    $lookup:
                    {
                        from: "userteamsckts" + dbkey,
                        localField: "uteamid",
                        foreignField: "_id",
                        as: "teamdetail",
                        pipeline: [
                            {
                                $match:
                                {
                                    "userid": params.userid
                                },
                            },
                        ]
                    }
                },
                {
                    "$unwind": "$teamdetail"
                },

            ]
            )

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

                let userteamSCktList = await UserCktLeagueSchema.find({ "userid": params.userid, "league_id": params.league_id });

                userteamSCktList.forEach(async (itemUserteam) => {
                    let usrPlayer = await UserPlayersCktSchema.aggregate([
                        {
                            "$match": { userid: params.userid, "league_id": params.league_id, "uteamid": ObjectID(itemUserteam._id) }
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
                        allType["logo_url_team"] = ""; //cktLDetail.logo_path;
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

                /*
                usrPlayer.forEach(async (item) => {

                    let batCntA = item2.players.filter(x => x.pid == item.pid);

                    let cntBat = 0, cntBowl = 0, cntWk = 0, cntAll = 0;
                    cntBat = (teamObj[item.uteamid] && teamObj[item.uteamid]["bat"]) ? teamObj[item.uteamid]["bat"] : 0;
                    cntBowl = (teamObj[item.uteamid] && teamObj[item.uteamid]["bowl"]) ? teamObj[item.uteamid]["bowl"] : 0;
                    cntWk = (teamObj[item.uteamid] && teamObj[item.uteamid]["wk"]) ? teamObj[item.uteamid]["wk"] : 0;
                    cntAll = (teamObj[item.uteamid] && teamObj[item.uteamid]["all"]) ? teamObj[item.uteamid]["all"] : 0;

                    if (batCntA && batCntA.length > 0) {
                        batCntA = batCntA[0];

                        let allType = { "bat": 0, "bowl": 0, "wk": 0, "all": 0 }
                        allType["bat"] = (batCntA.playing_role == "bat") ? ++cntBat : cntBat;
                        allType["bowl"] = (batCntA.playing_role == "bowl") ? ++cntBowl : cntBowl;
                        allType["wk"] = (batCntA.playing_role == "wk") ? ++cntWk : cntWk;
                        allType["all"] = (batCntA.playing_role == "all") ? ++cntAll : cntAll;
                        allType["uteamid"] = item.uteamid;
                        allType["team_no"] = item.team_no;

                        let teamList = [];

                        item.team_count && Object.keys(item.team_count).length > 0 && Object.keys(item.team_count).map((itemId) => {

                            let finalTeamDetail = {};
                            finalTeamDetail = (newteam[itemId]) ? newteam[itemId] : {};

                            finalTeamDetail["team_no"] = (item.team_count && item.team_count[itemId]) ? item.team_count[itemId] : 0;
                            teamList.push(finalTeamDetail)
                        })


                        allType["team_count"] = teamList;

                        teamObj[item.uteamid] = allType;

                    }
                    

                })

                */
            })

            let myUsrTeam = await UserCktLeagueSchema.countDocuments({
                league_id: params.league_id,
                userid: params.userid
            })

            let joinContestCount = await JoinContestsSchema.countDocuments({
                league_id: params.league_id,
                userid: params.userid

            })

            let cktname = await CktLeaguesSchema.findOne({ cid: params.league_id })

            let checkhttpurl = isValidHttpUrl(cktname.logo_url)
            if (checkhttpurl) {
                cktname.logo_url = cktname.logo_url
            } else {
                cktname.logo_url = `${env.awsimgurl}profile_doc/${cktname.logo_url}`
            }
            let series_logo_url = cktname.logo_url

            letSendTeamData = {
                title: cktname.name,
                logo_url: series_logo_url,

            }


            teamObj = (teamObj) ? Object.values(teamObj) : [];

            return res.send({ status: true, data: teamObj, mypicks: myUsrTeam, contestCount: joinContestCount, matchDetail: letSendTeamData, message: teamObj.length > 0 ? "Your team list" : "You have not created any team of players" });


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

            const dbName = req.userData.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const JoinContestsSchema = createSeriesJoinContestsModel(vendorDbConnection);
            const UserPlayersFbSchema = createUserPlayersFbModel(vendorDbConnection);
            const UserFbLeagueSchema = createUserFbLeagueModel(vendorDbConnection);

            const params = req.body
            params.userid = req.user.id
            let teamObj = {};

            let footLDetail = await FbLeaguesSchema.findOne({ "season_id": params.league_id })

            //Todo: Not using this
            let fbPlayerList = await FbPlayerDetailsSchema.aggregate([{ "$match": { "season_id": params.league_id } },
            {
                "$group":
                {
                    _id: "$pid", "pid": { $first: "$pid" }, "position_id": { $first: "$position_id" }, "tid": { $first: "$tid" }
                }
            }
            ])


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
                    allType["team"] = footLDetail.name;
                    allType["logo_url_team"] = footLDetail.logo_path;
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

            }


            teamObj = (teamObj) ? Object.values(teamObj) : [];
            return res.send({ status: true, data: teamObj, mypicks: myUsrTeam, contestCount: joinContestCount, matchDetail: letSendTeamData, message: teamObj.length > 0 ? "Your team list" : "You have not created any team of players" });

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },

    clone_match_player_list: async (req, res, next) => {
        try {
            const dbName = req.userData.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UserPlayerMatchCktsSchema = createUserPlayerMatchCktsModel(vendorDbConnection);
            const UserTeamCktSchema = createUserTeamCktModel(vendorDbConnection);

            const params = req.body;
            params.userid = req.user.id
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
            }))
            return res.send(response({ uteamid: params.uteamid }, "Clone Match Player List Successfully!.", true));
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    clone_match_fb_player_list: async (req, res, next) => {
        try {
            const dbName = req.userData.dbName;
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
            const dbName = req.userData.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UserPlayersCktSchema = createUserPlayersCktModel(vendorDbConnection);
            const UserCktLeagueSchema = createUserCktLeagueModel(vendorDbConnection);

            const params = req.body;
            params.userid = req.user.id
            let find_player = await UserPlayersCktSchema.find({ uteamid: params.uteamid })
            params.league_id = find_player[0].league_id
            let new_playerteam = await UserCktLeagueSchema.create(params);

            let uteamid = new_playerteam._id
            params.uteamid = uteamid

            await Promise.all(find_player.map(async function (item) {
                const createData = {
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
            const dbName = req.userData.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UserPlayersFbSchema = createUserPlayersFbModel(vendorDbConnection);
            const UserFbLeagueSchema = createUserFbLeagueModel(vendorDbConnection);

            const params = req.body;
            params.userid = req.user.id
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
            const dbName = req.userData.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UserPlayerMatchCktsSchema = createUserPlayerMatchCktsModel(vendorDbConnection);

            const params = req.body;
            let pid_array_list = []
            let match_player_lists = await UserPlayerMatchCktsSchema.find({ uteamid: params.uteamid }, { pid: 1 });
            Promise.all(match_player_lists.filter((item) => pid_array_list.push(item.pid)))
            return res.send(response(pid_array_list, "User Match Player List Successfully!.", true));
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    user_fb_match_player_list: async (req, res, next) => {
        try {
            const dbName = req.userData.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UserPlayerMatchFbsSchema = createUserPlayerMatchFbsModel(vendorDbConnection);

            const params = req.body;
            let pid_array_list = []
            let match_player_lists = await UserPlayerMatchFbsSchema.find({ uteamid: params.uteamid }, { pid: 1 });
            Promise.all(match_player_lists.filter((item) => pid_array_list.push(item.pid)))
            return res.send(response(pid_array_list, "User Match Player List Successfully!.", true));
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    edit_match_player_list: async (req, res, next) => {
        try {
            const dbName = req.userData.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UserPlayerMatchCktsSchema = createUserPlayerMatchCktsModel(vendorDbConnection);
            const UserPlayerMatchFbsSchema = createUserPlayerMatchFbsModel(vendorDbConnection);

            const params = req.body;
            if (params.type == "Cricket") {
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
                        teama_count: params.teama_count,
                        teamb_count: params.teamb_count,
                        team_no: params.team_no
                    })

                }

                await UserPlayerMatchCktsSchema.insertMany(match_player_list)
                return res.send(response({}, "Match Player List Edit Successfully!.", true));

            } else if (params.type == "Football") {
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
                        teama_count: params.teama_count,
                        teamb_count: params.teamb_count,
                        team_no: params.team_no
                    })
                }

                await UserPlayerMatchFbsSchema.insertMany(match_player_list)
                return res.send(response({}, "Match Player List Edit Successfully!.", true));
            }
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    edit_series_player_list: async (req, res, next) => {
        try {
            const dbName = req.userData.dbName;
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
                await UserPlayersCktSchema.deleteMany({ league_id: params.league_id, uteamid: params.uteamid });
                let newAddPlayerPID = await pid.filter(x => !v.includes(x));
                for (let i = 0; i < newAddPlayerPID.length; i++) {
                    series_player_list.push({
                        is_substitue: 0, pid: newAddPlayerPID[i],
                        league_id: params.league_id,
                        uteamid: params.uteamid,
                        userid: req.user.id,
                        team_count: params.team_count,
                        // team_no: params.team_no
                    })
                }

                await UserPlayersCktSchema.insertMany(series_player_list)
                return res.send(response({}, "Series Player List Edit Successfully!.", true));

            } else if (params.type == "Football") {
                let series_player_lists = await UserPlayersFbSchema.find({ league_id: params.league_id });
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
                        is_substitue: 0, pid: newAddPlayerPID[i],
                        league_id: params.league_id,
                        uteamid: params.uteamid,
                        userid: req.user.id,
                        team_count: params.team_count,
                        // team_no: params.team_no
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
     series_match_lists: async (send_array) => {//cid, type, status
        try {
            const params = { cid: send_array.cid, type: send_array.type,status:send_array.status,"contest_id":send_array.contest_id }
            if(params?.contest_id){
                params.contest_id = ObjectId(params.contest_id);
            }
            let match_list = [];
            const dbName = send_array.userData.dbName;
            console.log("paramsseries_match_lists--->>",dbName,params)
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const ContestSeriesSchema=createContestSeriesModel(vendorDbConnection);
            if (params.type == 'ckt') {
                
                const cktDbConnection = await connectWithCricketDb();
                const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);
                const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);

                let condition={ cid: params.cid };
                if(send_array?.contest_id){
                    let contestSeries=await ContestSeriesSchema.findOne({"contest_id":params.contest_id})
                    condition["date_start_ist"]={"$gte":contestSeries.date_start,"$lte":contestSeries.date_end}
                }
                console.log("condition--->>",condition);
                match_list = await UpcomingCricketsSchema.find(condition).sort({ "date_start_ist": 1 }).lean();
                console.log("match_list--->>",match_list);
                
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

                let condition={ season_id: params.cid };
                if(send_array?.contest_id){
                    let contestSeries=await ContestSeriesSchema.findOne({"contest_id":send_array.contest_id})
                    condition["date_start_ist"]={"$gte":contestSeries.date_start,"$lte":contestSeries.date_end}
                }
                console.log("condition11--->>",condition);
                match_list = await FbUpcomingsSchema.find(condition, { league_id: 1, match_id: 1, teama: 1, teamb: 1, title: 1, status: 1, rstatus: 1, league_name: 1, date_start_ist: 1, scores: 1, date_start: 1, result: 1, status_note: 1 }).lean();
                if (send_array.status == 3) {
                    let league_detail = await FbLeaguesSchema.findOne(
                        { league_id: params.cid },
                        { name: 1, date_start: 1, date_end: 1, logo_path: 1, season_id: 1, current_season_id: 1 }
                    ).sort({ date_start: -1 }).skip(1).limit(1).lean();

                    console.log("league_detail", league_detail)
                    match_list = await FbUpcomingsSchema.find({ season_id: params.cid, season_id: league_detail.season_id }, { league_id: 1, match_id: 1, teama: 1, teamb: 1, title: 1, status: 1, rstatus: 1, league_name: 1, date_start_ist: 1, scores: 1, date_start: 1, result: 1, status_note: 1 }).lean();
                }
                if (match_list && match_list.length > 0) {
                    match_list = await Promise.all(match_list.map(async (item) => {
                        let league_detail = await FbLeaguesSchema.findOne({ league_id: item.league_id }, { name: 1, logo_path: 1, league_id: 1 })
                        item.league_detail = league_detail;
                        return item;
                    }))
                }
            }

            return response(match_list, "Successfully Series Match list view Successfully!.", true);
            //  return res.send(response(match_list, "Series Match list view Successfully!.", true));
        } catch (error) {
            // return res.status(400).send(response({}, "Something went wrong.!!!", false))
        }
    },
    series_team_stats_list: async (send_param) => {
        try {
            //const params = req.body;
            const params = { cid: send_param.cid, type: send_param.type,status:send_param.status }
            let send_array = {};
            params.cid=parseInt(params.cid);
            console.log("params--->>",params);
            if (params.type == 'ckt') {
                const cktDbConnection = await connectWithCricketDb();
                const CktTeamMetaDataSchema = createCktTeamMetaDataModel(cktDbConnection);
                const CktTeamsSchema = createCktTeamsModel(cktDbConnection);
                const CktPlayerMetaDataSchema = createCktPlayerMetaDataModel(cktDbConnection);
                const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);
                const CktSeriesTeamBowlStatsSchema = createCktSeriesTeamBowlStatsModel(cktDbConnection);
                const CktSeriesTeamSchema = createCktSeriesTeamModel(cktDbConnection);
                const CktSeriesMetaDataSchema = createCktSeriesMetaDataModel(cktDbConnection);
                const CktSeriesTeamBatStatsSchema = createCktSeriesTeamBatStatsModel(cktDbConnection);

                let league_detail = await CktLeaguesSchema.findOne({ cid: params.cid }, { name: 1, date_start: 1, date_end: 1, logo_url: 1 }).lean();
                if (league_detail && league_detail.logo_url) {
                    league_detail.logo_url = `${env.awsimgurl}profile_doc/${league_detail.logo_url}`
                } else {
                    let itemLogo = await CktSeriesMetaDataSchema.findOne({ league_id: params.cid });
                    if (itemLogo?.logo_url) {
                        league_detail.logo_url = itemLogo.logo_url ? `${env.awsimgurl}profile_doc/${itemLogo.logo_url}` : "";
                    }
                }

                let cktSeriesTeamList = await CktSeriesTeamSchema.find({ cid: params.cid });
                if (cktSeriesTeamList.length == 0) {
                    cktSeriesTeamList = await CktTeamsSchema.find({ cid: params.cid }, { team_id: 1, cid: 1, team: 1, createdAt: 1, updatedAt: 1 }).lean();

                    cktSeriesTeamList.map((item) => {
                        item.draw = 0;
                        item.lastfivematch = "";
                        item.lastfivematchresult = "";
                        item.loss = 0
                        item.netrr = 0;
                        item.nr = 0;
                        item.overagainst = 0;
                        item.overfor = 0;
                        item.played = 0;
                        item.points = 0;
                        item.quality = false;
                        item.runagainst = 0;
                        item.runfor = 0;
                        item.win = 0;
                        return item;
                    })
                }

                dataList = await Promise.all(cktSeriesTeamList.map(async (item) => {

                    let teamLogo = await CktTeamMetaDataSchema.findOne({ team_id: item.team.tid });
                    if (teamLogo) {
                        return item.team.thumb_url = `${env.awsimgurl}profile_doc/${teamLogo.logo_url}`
                    }
                }))


                // let cktSeriesTeamStatsBatList = await cktSeriesTeamStatsBatSchema.aggregate([
                //     {
                //        "$match":{cid:params.cid}
                //        },
                //     {
                //        "$group":{_id:{"pid":"$player.pid"},"player":{"$first":"$player"},"average":{"$first":"$average"},"innings":{"$first":"$innings"},"runs":{"$first":"$runs"},"matches":{"$first":"$matches"}}
                //     }
                //    ])

                let cktSeriesTeamStatsBatList = await CktSeriesTeamBatStatsSchema.find({ cid: params.cid });
                PlyList = await Promise.all(cktSeriesTeamStatsBatList.map(async (item) => {
                    let playerLogo = await CktPlayerMetaDataSchema.findOne({ pid: item.player.pid, });
                    if (playerLogo) {
                        let playerLogo = await CktPlayerMetaDataSchema.findOne({ pid: item.player.pid, });
                        return item.player.thumb_url = `${env.awsimgurl}profile_doc/${playerLogo.logo_url}`
                    }
                }))


                let cktSeriesTeamStatsBowlList = await CktSeriesTeamBowlStatsSchema.find({ cid: params.cid }).sort({ wickets: 1 });
                PlyList = await Promise.all(cktSeriesTeamStatsBowlList.map(async (item) => {
                    let playerLogo = await CktPlayerMetaDataSchema.findOne({ pid: item.player.pid, });
                    if (playerLogo) {
                        let playerLogo = await CktPlayerMetaDataSchema.findOne({ pid: item.player.pid, });
                        return item.player.thumb_url = `${env.awsimgurl}profile_doc/${playerLogo.logo_url}`
                    }
                }))
                send_array = { league_detail: league_detail, cktSeriesTeamList: cktSeriesTeamList, cktSeriesTeamStatsBatList: cktSeriesTeamStatsBatList, cktSeriesTeamStatsBowlList: cktSeriesTeamStatsBowlList }

            } else if (params.type == 'fb') {
                const footballDbConnection = await connectWithFootballDb();
                const FbSeriesTeamStatsSchema = createFbSeriesTeamStatsModel(footballDbConnection);
                const FbSeriesTeamSchema = createFbSeriesTeamModel(footballDbConnection);
                const FbLeaguesSeasons = createFbLeaguesSeasonsModel(footballDbConnection);
                const  FbLeagueDetailsSchema=createFbLeagueDetailsModel(footballDbConnection);

                
                let league_detail=null,fbSeriesTeamStats=null;
                let fbSeriesTeam=null;
                if (params.status == 3) {
                    
                    league_detail = await FbLeaguesSeasons.findOne(
                        { season_id: params.cid },
                        { name: 1, date_start: 1, date_end: 1, logo_path: 1, season_id: 1, current_season_id: 1,league_id:1 }
                    ).sort({ date_start: -1 }).lean(); //.skip(1).limit(1).lean();
                    console.log("params.cid--->>",params.cid,league_detail);
                    //Todo: We are not using this
                    fbSeriesTeam = await FbSeriesTeamSchema.find({ season_id: params.cid });
                    fbSeriesTeamStats = await FbSeriesTeamStatsSchema.find({id : params.cid });
                    
                } else {
                    league_detail = await FbLeaguesSeasons.findOne(
                        { season_id: params.cid },
                        { name: 1, date_start: 1, date_end: 1, logo_path: 1, season_id: 1, current_season_id: 1,league_id:1 }
                    ).sort({ date_start: -1 }).lean();

                    fbSeriesTeam = await FbSeriesTeamSchema.find({ season_id: params.cid });
                    fbSeriesTeamStats = await FbSeriesTeamStatsSchema.find({ id: params.cid });
                }

                let leagueDetail=await FbLeagueDetailsSchema.findOne({"id":league_detail.league_id});
                league_detail["logo_path"]=leagueDetail?.logo_path;
                
                send_array = { league_detail: league_detail, fbSeriesTeamList: fbSeriesTeam, fbSeriesTeamStatsList: fbSeriesTeamStats }
                
            }
            return response(send_array, "Series list view Successfully!.", true);
            // return res.send(response(send_array, "Series list view Successfully!.", true));
        } catch (error) {
            console.log("error--->>", error);
            return response({}, "Something went wrong.!!!", false, null, error.stack)
            //return res.status(400).send(response({}, "Something went wrong.!!!", false))
        }
    },
    commentary_score_list: async (params) => {//RamanTestv2
        try {
            //const params = { match_id: match_id, type: type }
            params.match_id=parseInt(params.match_id);
            

            /*
            //Code for selected players by Users
            const dbName = params.userData.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const JoinMatchContestsSchema = createJoinMatchContestsModel(vendorDbConnection);
            const PoolSchema = createPoolModel(vendorDbConnection);
            */

            // let page = parseInt(req.query.page || 1)
            // let limit = parseInt(req.query.limit || 10);
            // let startIndex = (page - 1) * limit;
            //  let endIndex = page * limit;

            let live_score = {}
            let commentary = {}
            let livefullscore = {}
            let player_list = {}

            //Code for selected players by Users
            //let totalUsrCnt = await JoinMatchContestsSchema.countDocuments({ match_id: params.match_id });
            if (params.type == "ckt") {
                const cktDbConnection = await connectWithCricketDb();
                const CktCommentarySchema = createCktCommentaryModel(cktDbConnection);
                const CktPlayerMetaDataSchema = createCktPlayerMetaDataModel(cktDbConnection);
                const CktPlayersFantasyPointsSchema = createCktPlayersFantasyPointsModel(cktDbConnection);
                const CktPlayersSchema = createCktPlayersModel(cktDbConnection);
                const CktMatchScoresSchema = createCktMatchScoresModel(cktDbConnection);

                //Code for selected players by Users
                //const UserPlayerMatchCktsSchema = createUserPlayerMatchCktsModel(vendorDbConnection);

                commentary = await CktCommentarySchema.find({ match_id: params.match_id }).sort({ innings: -1 })

                if (commentary.length > 1 && commentary[1].innings == 2 && commentary[1].commentaries != undefined) {
                    commentary = commentary[1]
                } else if (commentary.length > 0) {
                    commentary = commentary[0]
                }

                //  commentary = await cktcommentarySchemas.find({ match_id: params.match_id }).sort({inning:1})

                livefullscore = await CktMatchScoresSchema.findOne({ match_id: params.match_id })
                player_list = await CktPlayersSchema.aggregate([
                    {
                        "$match":{ match_id: params.match_id, is_playing: 1 }
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
                                        "match_id":params.match_id
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

                
                //.find({ match_id: params.match_id, is_playing: 1 }).lean();

                // if (player_list.length == 0) {
                //     player_list = await CktPlayersSchema.find({ match_id: params.match_id, is_playing: 2 }).lean();
                //     // player_list.fantasy_point = 0;
                // }
                
                /*
                //Code for selected players by Users
                player_list = await Promise.all(player_list.map(async (item, indexPL) => {
                    return new Promise(async (resolve, reject) => {

                        // let cktFantasyPoint = await CktPlayersFantasyPointsSchema.findOne({ match_id: params.match_id, pid: item.pid }, { tp: 1 }).lean();
                        // item.fantasy_point = (cktFantasyPoint && cktFantasyPoint.tp) ? cktFantasyPoint.tp : 0;

                        // Start selected Counts Calculation For player Accumulator && Contest Accumulator
                        let player_match_deatil = await CktPlayersSchema.distinct("match_id", { tid: item.tid });

                        if (player_match_deatil.length > 0) {


                            let active_match = await PoolSchema.aggregate([
                                { $match: { match_id: { $in: player_match_deatil } } },
                                {
                                    $group: {
                                        "_id": { "gtype": "$gtype" }, match_id: { $first: "$match_id" }
                                    }
                                }
                            ])

                            let user_player_join = await UserPlayerMatchCktsSchema.aggregate([
                                { $match: { match_id: item.match_id, pid: item.pid } },
                                {
                                    "$group": {
                                        _id: { "pid": "$pid" },
                                        count: { $sum: 1 },
                                        "pid": { $first: "$pid" }
                                    }
                                }
                            ])

                            let plyCnt = user_player_join.filter(x => x["pid"] === item.pid);
                            plyCnt = plyCnt && plyCnt.length > 0 ? plyCnt[0]["count"] : 0;

                            if (active_match.length > 0 && user_player_join.length > 0) {
                                active_match = active_match.length;
                                user_player_join = user_player_join.length;
                                //item.selected_by = (user_player_join*100)/active_match
                                item.selected_by = (totalUsrCnt > 0) ? (plyCnt * 100 / totalUsrCnt).toFixed(2) : 0

                            } else {
                                item.selected_by = 0;
                            }

                        }
                        // End selected Counts Calculation For player Accumulator && Contest Accumulator 
                        
                        resolve(item);

                    })
                }))
                */
                
                // }
                if (livefullscore?.teama?.team_id) {
                    const CktTeamMetaDataSchema = createCktTeamMetaDataModel(cktDbConnection);

                    let teamMeta = await CktTeamMetaDataSchema.find({
                        team_id: { "$in": [livefullscore.teama.team_id, livefullscore.teamb.team_id] }
                    })

                    let teamDetailMetaA = teamMeta.filter(x => x.team_id == livefullscore.teama.team_id);
                    teamDetailMetaA = teamDetailMetaA && teamDetailMetaA[0];
                    let teamDetailMetaB = teamMeta.filter(x => x.team_id == livefullscore.teamb.team_id);
                    teamDetailMetaB = teamDetailMetaB && teamDetailMetaB[0];
                    livefullscore.teama.logo_url = (teamDetailMetaA && teamDetailMetaA.logo_url) ? `${env.awsimgurl}profile_doc/${teamDetailMetaA.logo_url}` : livefullscore.teama.logo_url;
                    livefullscore.teamb.logo_url = (teamDetailMetaB && teamDetailMetaB.logo_url) ? `${env.awsimgurl}profile_doc/${teamDetailMetaB.logo_url}` : livefullscore.teamb.logo_url;
                }

                // let PlyList = await Promise.all(player_list.map(async (item) => {
                //     //let playerLogo = await CktPlayerMetaDataSchema.findOne({ pid: item.pid, });
                //     if (playerLogo) {
                //         return item.thumb_url = `${env.awsimgurl}profile_doc/${playerLogo.logo_url}`
                //     }

                // }))

                live_score = { commentary_ckt: commentary, livescore_ckt: livefullscore, player_list: player_list }
            } else if (params.type == "fb") {
                const footballDbConnection = await connectWithFootballDb();
                const FbPlayersSchema = createFbPlayersModel(footballDbConnection);
                const FbScoresSchema = createFbScoresModel(footballDbConnection);
                const FbHighlightVideoSchema = createFbHighlightVideoModel(footballDbConnection);
                const FbCommentarySchema = createFbCommentaryModel(footballDbConnection);
                const FbPlayerFantasyPointsSchema = createFbPlayerFantasyPointsModel(footballDbConnection);

                //const UserPlayerMatchFbsSchema = createUserPlayerMatchFbsModel(vendorDbConnection);
                const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);
                const FbPlayerDetailsSchema = createFbPlayerDetailsModel(footballDbConnection);

                let fbUpcomDetail = await FbUpcomingsSchema.findOne({ match_id: params.match_id });

                commentary = await FbCommentarySchema.findOne({ match_id: params.match_id })
                livefullscore = await FbScoresSchema.findOne({ match_id: params.match_id }).lean();
                
                if (livefullscore && livefullscore.lineup && livefullscore.lineup.data.length > 0) {
                    livefullscore.lineup.data = await Promise.all(livefullscore.lineup.data.map(async (item) => {

                        let pID=item.player_id;

                        let plyDetail = await FbPlayerDetailsSchema.findOne({pid: pID},{"pid":1,"common_name":1,"image_path":1}).lean();
                        let fbFantasyPoint = await FbPlayerFantasyPointsSchema.findOne({ match_id: params.match_id, pid: pID }, { tp: 1 }).lean();

                        let data=plyDetail;
                        item["player"]={data};
                        item["player_name"]=plyDetail?.["common_name"] || "";
                        if(item["player_name"]==""){
                            console.log("PID====>>",pID);
                        }

                        item.player.data["fantasy_point"] = (fbFantasyPoint && fbFantasyPoint.tp) ? fbFantasyPoint.tp : 0;

                        /* 
                        //Start selected Counts Calculation For player Accumulator && Contest Accumulator
                        let player_match_deatil = await FbPlayersSchema.distinct("match_id",{"tid":item.team_id}); //{ $or: [{ "teama.team_id": item.tid }, { "teamb.team_id": item.tid }] });

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
                                { $match: { match_id: params.match_id, pid: item.player_id } },
                                {
                                    "$group": {
                                        _id: { "pid": "$pid" },
                                        count: { $sum: 1 },
                                        "pid": { $first: "$pid" }
                                    }
                                }
                            ])

                            let plyCnt = user_player_join.filter(x => x["pid"] === item.player_id);
                            plyCnt = plyCnt && plyCnt.length > 0 ? plyCnt[0]["count"] : 0;


                            if (active_match.length > 0 && user_player_join.length > 0) {
                                active_match = active_match.length;
                                user_player_join = user_player_join.length;
                                //item.player.data.selected_by = (user_player_join*100)/active_match
                                item.player.data.selected_by = (totalUsrCnt > 0) ? (plyCnt * 100 / totalUsrCnt).toFixed(2) : 0;//Add this

                            } else {
                                item.player.data.selected_by = 0;
                            }

                        }
                         //End selected Counts Calculation For player Accumulator && Contest Accumulator 
                        */



                        return item;
                    }))
                }else{
                    livefullscore={}
                }
                livefullscore["localteam"]=fbUpcomDetail?.localTeam?.data;
                livefullscore["visitorteam"]=fbUpcomDetail?.visitorTeam?.data;

                // let livematchfullscore = await fbmatchstaticsScoreSchema.findOne({ match_id: params.match_id })
                let highlightsVideo = await FbHighlightVideoSchema.findOne({ match_id: params.match_id })
                live_score = { commentary_fb: commentary, livescore_fb: livefullscore, livematchfullscore: livefullscore, highlightsVideo: highlightsVideo }
            }

            return response(live_score, "Score And Commentary list view Successfully!.", true);
        } catch (error) {
            console.log("error--->>",error)
            //  return res.status(400).send(response({}, "Something went wrong.!!!", false))
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
    team_profile_detail: async (req, res, next) => {
        try {
            let body_data = req.body;
            let send_array = {}
            if (body_data.gametype == 'ckt') {
                const cktDbConnection = await connectWithCricketDb();
                const CktTeamsSchema = createCktTeamsModel(cktDbConnection);
                const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);

                let date = new Date();
                let upcommingmatches = await UpcomingCricketsSchema.find({ "$or": [{ "teama.team_id": body_data.team_id }, { "teamb.team_id": body_data.team_id }], "date_start_ist": { "$gte": date } }, { match_id: 1, cid: 1, date_start_ist: 1, title: 1, format_str: 1 }).sort({ date_start_ist: 1 }).limit(5);

                let recentperformance = await UpcomingCricketsSchema.find({ "$or": [{ "teama.team_id": body_data.team_id }, { "teamb.team_id": body_data.team_id }], "date_start_ist": { "$lte": date } }, { match_id: 1, cid: 1, date_start_ist: 1, title: 1, format_str: 1, winning_team_id: 1 }).sort({ date_start_ist: 1 }).lean().limit(5);

                if (recentperformance && recentperformance.length > 0) {
                    recentperformance = recentperformance.map((item) => {
                        if (item.winning_team_id == body_data.team_id) {
                            item.winning_team = 'Win';
                        } else {
                            item.winning_team = 'Lose';
                        }
                        return item;
                    })
                }

                let team_player = await CktTeamsSchema.findOne({ "team_id": body_data.team_id }, { players: 1, team: 1 });
                send_array = { upcommingmatches: upcommingmatches, recentperformance: recentperformance, team_player: team_player.players, team_detail: team_player.team }

            } else if (body_data.gametype == 'fb') {

            }
            return res.send(response(send_array, "Team Detail view Successfully!.", true));
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false))
        }
    },
    myFixLiveResultMatchData: async (send_array) => {
        return new Promise(async (resolve, reject) => {
            const cktDbConnection = await connectWithCricketDb();
            const dbName = send_array.userData.dbName;
            
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);
            const UpcomingCricketPublishSchema=createUpcomingCricketPublishModel(vendorDbConnection);

            const footballDbConnection = await connectWithFootballDb();
            const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);
            const UpcomingFootballPublishSchema=createUpcomingFootballPublishModel(vendorDbConnection);
            

            send_array.rstatus = parseInt(send_array.rstatus);
            send_array.userid = ObjectId(send_array.userid);
            
            
            let condition = {
                rstatus: send_array.rstatus,
                "is_active": 1,
                "is_publish": 1
            }
            let currentDate = currentTimeZoneDate();
            
            if (send_array.rstatus == 3) {
                condition["date_start_ist"] = { "$gte": new Date(((currentDate / 1000) - (60 * 60 * 24 * 30)) * 1000) };
            }
            console.log("conditionconditioncondition", condition);
            let upcomingSchema = (send_array.type === "Cricket") ? UpcomingCricketPublishSchema : UpcomingFootballPublishSchema;
            let match_list = await upcomingSchema.aggregate([
                {
                    $match: condition
                },
                {
                    $lookup:
                    {
                        from: "join_match_contests",
                        localField: "match_id",
                        foreignField: "match_id",
                        as: "jmconts",
                    },
                },
                {
                    $unwind: {
                        "path": "$jmconts",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $lookup:
                    {
                        from: "join_acc_players",
                        localField: "match_id",
                        foreignField: "match_id",
                        as: "accplys",

                    }
                },
                {
                    "$match": { rstatus: send_array.rstatus, $or: [{ "jmconts.userid": send_array.userid }, { "accplys.userid": send_array.userid }] }
                },
                {
                    "$group": { _id: { "match_id": "$match_id" }, "id": { "$first": "$match_id" } }
                }
            ])
            console.log("mymatch_list--->>", match_list)
            if (match_list) {

                let userMatchIds = [];
                match_list.map((itemMId) => userMatchIds.push(itemMId.id));
                
                ////////////
                let emit_detail = `fix_live_result_match_data_v2_${dbName}_${send_array.rstatus}_${send_array.type}`;
                let getRedisData=await cacheStorageGet(emit_detail);
                let allPoolData=(getRedisData)?JSON.parse(getRedisData):{};
                console.log("allPoolData-fix_live_result_match_data_v2-->>",getRedisData);
                //////////////
                //socketDisconnect()
                //socketConnection();
                //socket.emit('fix_live_result_match_data_v2', { rstatus: send_array.rstatus, fetch_latest: 1, type: send_array.type, "authorization": send_array.authorization });
                let myPublishActiveMatchList = [];
                let myTotalCount = 0;

                //socket.on(`fix_live_result_match_data_v2_${send_array.userData.apikey}_${send_array.rstatus}_${send_array.type}`, (globalMatch) => {
                    //console.log("___fix_live_result_match_data_v2____")
                    //globalMatch = (globalMatch) ? JSON.parse(globalMatch) : [];
                    let matchList = (send_array.type === "Cricket") ? "match_list" : "football_list";
                    let glLength = (allPoolData?.[matchList]) ? allPoolData?.[matchList].length : 0;
                    allPoolData?.[matchList]?.forEach((item, inx) => {
                        if (userMatchIds.indexOf(item.match_id) > -1) {
                            myTotalCount++;
                            if (send_array.type === "Football") {
                                item["teama_logo"] = item["local_logo_path"];
                                item["teama_name"] = item["local_name"];
                                item["teama_short_name"] = item["local_short_name"];
                                item["teamb_logo"] = item["visit_logo_path"];
                                item["teamb_name"] = item["visit_name"];
                                item["teamb_short_name"] = item["visit_short_name"];
                                delete item["local_logo_path"];
                                delete item["local_name"];
                                delete item["local_short_name"];
                                delete item["visit_logo_path"];
                                delete item["visit_name"];
                                delete item["visit_short_name"];
                            }
                            myPublishActiveMatchList.push(item);


                        }
                        if (glLength === (inx + 1)) {
                            let data = { total_count: myTotalCount, "status_key": send_array.rstatus, "match_list": myPublishActiveMatchList };
                            console.log("datadata-->>", data)
                            resolve(response(data, "Successfull fetch", true, myTotalCount))
                        }
                    });

                //});

            } else {
                let data = { total_count: 0, "status_key": send_array.rstatus, "match_list": [] };
                resolve(response(data, "No Data", false))
            }

        })
    },
    series_match_contest_list: async (send_array) => {
        return new Promise(async (resolve, reject) => {

            const dbName = send_array.userData.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const ContestSeriesSchema = createContestSeriesModel(vendorDbConnection);

            console.log("=====series_match_contest_list=CHECK=======");

            socketConnection()
            socket.emit('series_match_data_v2', { cid: send_array.cid, type: send_array.type, "authorization": send_array.authorization });
            let myPublishActiveMatchList = [];
            let myTotalCount = 0;
            socket.on(`series_match_data_v2_${send_array.userData.dbName}_${send_array.cid}_${send_array.type}`, async (globalMatch) => {
                globalMatch = (globalMatch) ? JSON.parse(globalMatch) : [];
                
                
                let contestSeri = await ContestSeriesSchema.findOne({ "league_id": parseInt(send_array.cid), "contest_id": ObjectID(send_array.contest_id) });

                let date_start = contestSeri?.date_start;
                let date_end = contestSeri?.date_end;
                let result = globalMatch?.data?.filter(d => {
                    var time = new Date(d.date_start_ist).getTime();
                    return (date_start <= time && time <= date_end);
                });
                resolve(response(result, "Successfully Series Match list view Successfully!.", true));
            })

        })
    },
}

//console.log("dateTimeZone===>>",new Date(((dateTimeZone(new Date(),'Antarctica/Macquarie')/1000)-(60*60*24*30))*1000))


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
