let sdb = require("../../models");
const response = require("../../helper/response");
const { ObjectId, ObjectID } = require("mongodb");
const { settingDetail, dateTimeChange, calDeductBal, dateTimeZone, thirdWalletChkApi, keyGen, currentTimeZoneDate } = require("../../helper/common");
const { Promise } = require("mongoose");
const env = process.env;
const { socket, socketConnection } = require("./../view_model/Socket");
const { connectWithGeneralDb, connectWithCricketDb, connectWithFootballDb, connectWithVendorDb } = require("../../config/mongodb_connections");
const createGameSettingsModel = require("../../mongo_models_new/credexon_general/GameSettingsSchema");
const createPrivateContestWinsLabsModel = require("../../mongo_models_new/credexon_general/PrivateContestWinsLabsSchema");
const createCktTeamMetaDataModel = require("../../mongo_models_new/credexon_cricket/CktTeamMetaDataSchema");
const createPrivateContestSizesModel = require("../../mongo_models_new/credexon_general/PrivateContestSizesSchems");
const createCktPlayerMetaDataModel = require("../../mongo_models_new/credexon_cricket/CktPlayerMetaDataSchema");
const createCktLeaguesModel = require("../../mongo_models_new/credexon_cricket/CktLeaguesSchema");
const createUpcomingCricketModel = require("../../mongo_models_new/credexon_cricket/UpcomingCricketsSchema");
const createCricketPlayersModel = require("../../mongo_models_new/credexon_cricket/CktPlayerDetailsSchema");
const createCktSeriesMetaDataModel = require("../../mongo_models_new/credexon_cricket/CktSeriesMetaDataSchema");
const createCktPlayersModel = require("../../mongo_models_new/credexon_cricket/CktPlayersSchema");
const createFbUpcomingsModel = require("../../mongo_models_new/credexon_football/FbUpcomingsSchema");
const createFbPlayersModel = require("../../mongo_models_new/credexon_football/FbPlayersSchema");
const createFbPlayerDetailsModel = require("../../mongo_models_new/credexon_football/FbPlayerDetailsSchema");
const createFbSeriesMetaDatasModel = require("../../mongo_models_new/credexon_football/FbSeriesMetaDatasSchema");
const createFbLeaguesModel = require("../../mongo_models_new/credexon_football/FbLeaguesSchema");
const createFbTeamsModel = require("../../mongo_models_new/credexon_football/FbTeamsSchema");
const createContestsModel = require("../../mongo_models_new/credexon_vendor/ContestsSchema");
const createSettingsModel = require("../../mongo_models_new/credexon_general/SettingSchema");
const createContestSeriesModel = require("../../mongo_models_new/credexon_vendor/ContestSeriesSchema");
const createJoinMatchContestsModel = require("../../mongo_models_new/credexon_vendor/JoinMatchContestsSchema");
const createSeriesJoinContestsModel = require("../../mongo_models_new/credexon_vendor/JoinSeriesContestsSchema");
const createPoolModel = require("../../mongo_models_new/credexon_vendor/PoolSchema");
const createPoolPrizeBreaksModel = require("../../mongo_models_new/credexon_vendor/PoolPrizeBreaksSchema");
const createUserPlayerMatchCktsModel = require("../../mongo_models_new/credexon_vendor/UserPlayerMatchCktsSchema");
const createUserPlayerMatchFbsModel = require("../../mongo_models_new/credexon_vendor/UserPlayerMatchFbsSchema");
const createUserPlayersCktModel = require("../../mongo_models_new/credexon_vendor/UserPlayersSeriesCktSchema");
const createUserPlayersFbModel = require("../../mongo_models_new/credexon_vendor/UserPlayersSeriesFbSchema");
const createUserTeamCktModel = require("../../mongo_models_new/credexon_vendor/UserTeamCktSchema");
const createUserTeamFbModel = require("../../mongo_models_new/credexon_vendor/UserTeamFbSchema");
const createUserCktLeagueModel = require("../../mongo_models_new/credexon_vendor/UserCktSeriesTeamSchema");
const createUserFbLeagueModel = require("../../mongo_models_new/credexon_vendor/UserFbSeriesTeamSchema");
const createUsersModel = require("../../mongo_models_new/credexon_vendor/UsersSchema");
const createTransactionsModel = require("../../mongo_models_new/credexon_vendor/TransactionsSchema");
const createUserBonusModel = require("../../mongo_models_new/credexon_vendor/UserBonusSchema");
const createFbLeaguesSeasonsModel = require("../../mongo_models_new/credexon_football/FbLeagueSeasonsSchema");


let matchCricketPoolContestList = async (req, res, next) => {
    let playersSchema = null, userTeamSchema = null, joinContSchema = null, gametype = null, type = null, upcomingdatestart = null;

    const dbName = req.user.dbName;
    const vendorDbConnection = await connectWithVendorDb(dbName);
    const JoinMatchContestsSchema = createJoinMatchContestsModel(vendorDbConnection);
    const UserTeamCktSchema = createUserTeamCktModel(vendorDbConnection);
    const UserTeamFbSchema = createUserTeamFbModel(vendorDbConnection);
    const PoolSchema=createPoolModel(vendorDbConnection);

    if (req.body.gtype === "ckt") {
        const cktDbConnection = await connectWithCricketDb();
        const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);
        const CricketPlayersSchema = createCricketPlayersModel(cktDbConnection);

        playersSchema = CricketPlayersSchema;
        userTeamSchema = UserTeamCktSchema;
        joinContSchema = JoinMatchContestsSchema;
        gametype = "ckt", type = "m";
        upcomingdatestart = UpcomingCricketsSchema;
    } else {
        const footballDbConnection = await connectWithFootballDb();
        const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);
        const FbPlayersSchema = createFbPlayersModel(footballDbConnection);

        playersSchema = FbPlayersSchema;
        userTeamSchema = UserTeamFbSchema;
        joinContSchema = JoinMatchContestsSchema;
        gametype = "fb", type = "m";
        upcomingdatestart = FbUpcomingsSchema;
    }

    await matchCricketContestList(req, res, next, playersSchema, userTeamSchema, joinContSchema, gametype, type, upcomingdatestart);
}

let my_pool_contest_list = async (req, res, next, matchReq, joinContSchema, groupObject, userTeamSchema, type, userPlayerSchema,vendorDbConnection) => {
    try {
        const params = req.body;
        console.log("params--->>", params);
        const page = parseInt(req.query.page || 1)
        const limit = parseInt(req.query.limit || 10);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        groupObject = {
            ...groupObject,
            _id: { "userid": "$userid", "poolid": "$poolid" }, timesjoin: { $sum: 1 }, poolid: { $first: "$poolid" }, joinfee: { $first: "$poolpb.joinfee" }
            , totalwinamt: { $first: "$poolpb.totalwinamt" }, winners: { $first: "$poolpb.winners" }, maxteams: { $first: "$poolpb.maxteams" }
            , status: { $first: "$poolpb.status" }, type: { $first: "$poolpb.type" }, ispoolfull: { $first: "$poolpb.ispoolfull" }, iscancel: { $first: "$poolpb.iscancel" }
            , gtype: { $first: "$poolpb.gtype" }, c: { $first: "$poolpb.c" }, m: { $first: "$poolpb.m" }, s: { $first: "$poolpb.s" }, uptojoin: { $first: "$poolpb.uptojoin" }, joineduser: { $first: "$poolpb.joineduser" }
            , contest_id: { $first: "$poolpb.contestlst._id" }, contest_name: { $first: "$poolpb.contestlst.title" },
            //date_start: { "$first": "$poolpb.contestseries.date_start" }, date_end: { "$first": "$poolpb.contestseries.date_end" }
        };

        if (type === "s") {
            groupObject = {
                ...groupObject,
                date_start: { "$first": "$poolpb.contestseries.date_start" }, date_end: { "$first": "$poolpb.contestseries.date_end" }
            };
        }

        let currentDates = currentTimeZoneDate();

        let statusCond = null;
        let qContest = [];


        if (type === "s") {
            if (params.status === "upcoming") {
                statusCond = { "contestseries.date_start": { "$gte": currentDates } }
            } else
                if (params.status === "result") {
                    statusCond = { "contestseries.date_end": { "$lte": currentDates } }
                } else
                    if (params.status === "live") {
                        statusCond = { "contestseries.date_start": { "$lte": currentDates }, "contestseries.date_end": { "$gte": currentDates } }
                    }
            qContest = [
                {
                    $lookup:
                    {
                        from: "contests",
                        localField: "contest_id",
                        foreignField: "_id",
                        as: "contestlst",
                    },
                },
                { "$unwind": "$contestlst" },
                {
                    $lookup:
                    {
                        from: "contest_series",
                        localField: "contest_id",
                        foreignField: "contest_id",
                        as: "contestseries",

                    }

                },
                {
                    $unwind: {
                        "path": "$contestseries",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$match": statusCond
                }

            ]
        } else {
            qContest = [
                {
                    $lookup:
                    {
                        from: "contests",
                        localField: "contest_id",
                        foreignField: "_id",
                        as: "contestlst",
                    },
                },
                { "$unwind": "$contestlst" }

            ]
        }

        console.log("req.body,matchReq,qContest,groupObject-->>",req.body,matchReq,qContest,groupObject)
        
        if (type === "s" && req?.body?.contest_id) {
            
            let contestID=req.body.contest_id;
            let leagueId=req.body.league_id;
            const PoolSchema=createPoolModel(vendorDbConnection);
            let poolList=await PoolSchema.distinct("_id",{league_id:leagueId,type:"s",contest_id:ObjectId(contestID)});
            matchReq["poolid"]={"$in":poolList};
        }
        console.log("matchReqss-->>",matchReq)
        
        //limit and pagination 
        let match_list = await joinContSchema.aggregate([
            {
                $match: matchReq
            },
            {
                $lookup:
                {
                    from: "pools",
                    localField: "poolid",
                    foreignField: "_id",
                    as: "poolpb",
                    pipeline: qContest
                },
            },

            { "$unwind": "$poolpb" },

            {
                $group: groupObject
            },
            {
                $lookup:
                {
                    from: "pool_prize_breaks",
                    localField: "poolid",
                    foreignField: "pool_id",
                    as: "poolpb",
                },
            },

            { $unset: ["_id"] },

            {
                $facet: {
                    data: [{ $skip: startIndex }, { $limit: endIndex }],
                    total_count: [
                        {
                            $count: 'count'
                        }
                    ]
                }
            }

        ])



        let dataCount = (match_list && match_list[0] && match_list[0].total_count && match_list[0].total_count[0] && match_list[0].total_count[0]["count"]) ? match_list[0].total_count[0]["count"] : 0;
        let dataList = (match_list && match_list[0] && match_list[0].data) ? match_list[0].data : [];
        // let status = dataCount > 0 ? true : false
        console.log("DATA--->>", dataCount, JSON.stringify(match_list))
        let m_s_id = "";
        if (type == "m") {
            m_s_id = "match_id";
        } else if (type == "s") {
            m_s_id = "league_id";
        }
        let where = {
            [m_s_id]: parseInt(params[m_s_id])
        }
        let myUsrTeam = await userTeamSchema.countDocuments({
            [m_s_id]: parseInt(params[m_s_id]),
            userid: ObjectId(req.user.id)
        })

        // let joinContestCount = await joinContSchema.countDocuments(
        //     matchReq
        //     // {
        //     //     [m_s_id]: parseInt(params[m_s_id]),
        //     //     userid: req.user.id,
        //     // }
        // )

        console.log("dataList-->>",dataList)
        let status = true
        return res.send(response({
            total_count: dataCount,
            status_key: params.rstatus,
            match_list: dataList,
            // detply: detply,
            contestCount: dataCount,
            mypicks: myUsrTeam,
            // status: dataCount > 0 ? true : false,
        }, dataCount > 0 ? "My Match view succesfully.!!!" : "No data found.!!!", status))
    } catch (error) {
        return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
};

module.exports = {
    // pool_contest_list:async(req,res,next)=>{


    match_cricket_pool_contest_list: async (req, res, next) => {
        const cktDbConnection = await connectWithCricketDb();
        const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);
        const CricketPlayersSchema = createCricketPlayersModel(cktDbConnection);

        const dbName = req.user.dbName;
        const vendorDbConnection = await connectWithVendorDb(dbName);
        const JoinMatchContestsSchema = createJoinMatchContestsModel(vendorDbConnection);
        const UserTeamCktSchema = createUserTeamCktModel(vendorDbConnection);

        let playersSchema = CricketPlayersSchema;
        let userTeamSchema = UserTeamCktSchema;
        let joinContSchema = JoinMatchContestsSchema;
        let gametype = "ckt", type = "m";
        let upcomingdatestart = UpcomingCricketsSchema;
        matchCricketContestList(req, res, next, playersSchema, userTeamSchema, joinContSchema, gametype, type, upcomingdatestart);
    },
    match_football_pool_contest_list: async (req, res, next) => {
        const footballDbConnection = await connectWithFootballDb();
        const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);
        const FbPlayersSchema = createFbPlayersModel(footballDbConnection);

        const dbName = req.user.dbName;
        const vendorDbConnection = await connectWithVendorDb(dbName);
        const JoinMatchContestsSchema = createJoinMatchContestsModel(vendorDbConnection);
        const UserTeamFbSchema = createUserTeamFbModel(vendorDbConnection);

        const playersSchema = FbPlayersSchema;
        const userTeamSchema = UserTeamFbSchema;
        const joinContSchema = JoinMatchContestsSchema;
        const gametype = "fb", type = "m";
        const upcomingdatestart = FbUpcomingsSchema;
        matchCricketContestList(req, res, next, playersSchema, userTeamSchema, joinContSchema, gametype, type, upcomingdatestart);
    },
    series_cricket_pool_contest_list: async (req, res, next) => {
        const cktDbConnection = await connectWithCricketDb();
        const CricketPlayersSchema = createCricketPlayersModel(cktDbConnection);

        const dbName = req.user.dbName;
        const vendorDbConnection = await connectWithVendorDb(dbName);
        const JoinContestsSchema = createSeriesJoinContestsModel(vendorDbConnection);
        const UserCktLeagueSchema = createUserCktLeagueModel(vendorDbConnection);

        const playersSchema = CricketPlayersSchema;
        const userTeamSchema = UserCktLeagueSchema;
        const joinContSchema = JoinContestsSchema;
        const gametype = "ckt", type = "s";

        matchCricketContestList(req, res, next, playersSchema, userTeamSchema, joinContSchema, gametype, type);
    },
    series_football_pool_contest_list: async (req, res, next) => {
        const footballDbConnection = await connectWithFootballDb();
        const FbPlayersSchema = createFbPlayersModel(footballDbConnection);

        const dbName = req.user.dbName;
        const vendorDbConnection = await connectWithVendorDb(dbName);
        const JoinContestsSchema = createSeriesJoinContestsModel(vendorDbConnection);
        const UserFbLeagueSchema = createUserFbLeagueModel(vendorDbConnection);

        const playersSchema = FbPlayersSchema;
        const userTeamSchema = UserFbLeagueSchema;
        const joinContSchema = JoinContestsSchema;
        const gametype = "fb", type = "s";

        matchCricketContestList(req, res, next, playersSchema, userTeamSchema, joinContSchema, gametype, type);
    },

    filter_contest_ckt: async (req, res, next) => {
        const cktDbConnection = await connectWithCricketDb();
        const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);
        const CricketPlayersSchema = createCricketPlayersModel(cktDbConnection);

        const dbName = req.user.dbName;
        const vendorDbConnection = await connectWithVendorDb(dbName);
        const JoinMatchContestsSchema = createJoinMatchContestsModel(vendorDbConnection);
        const UserTeamCktSchema = createUserTeamCktModel(vendorDbConnection);

        const playersSchema = CricketPlayersSchema;
        const userTeamSchema = UserTeamCktSchema;
        const joinContSchema = JoinMatchContestsSchema;
        const gametype = "ckt", type = "m";
        const upcomingdatestart = UpcomingCricketsSchema;
        matchCricketContestList(req, res, next, playersSchema, userTeamSchema, joinContSchema, gametype, type, upcomingdatestart);
    },

    series_pool_detail: async (req, res, next) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);
            const CktSeriesMetaDataSchema = createCktSeriesMetaDataModel(cktDbConnection);

            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const JoinContestsSchema = createSeriesJoinContestsModel(vendorDbConnection);
            const PoolSchema = createPoolModel(vendorDbConnection);

            let db = (await sdb())[global.gdbname[req.user.apikey]];
            const params = req.body;
            let limit = (req.query.page != undefined) ? parseInt(req.query.limit) : 4;
            let page = (req.query.page != undefined) ? parseInt(req.query.page) : 0;
            let skip = page * limit;
            let dbkey = keyGen(req.user.apikey);

            let sendResponse = {
                poolData: '',
                leaderBoardData: '',
                matchDetail: '',
                myLeaderBoardData: ''
            }
            let where = {
                league_id: parseInt(params.league_id)
            }
            await PoolSchema.aggregate(
                [
                    {
                        $match: { "_id": ObjectId(params.pool_id) }
                    },
                    //{ $project: { _id: 1, pmin: 1, pmax: 1, pamount: 1 } },

                    {
                        $lookup:
                        {
                            from: "pool_prize_breaks",
                            localField: "_id",
                            foreignField: "pool_id",
                            as: "poolbreakpoint",
                        },
                    },
                ]).then((result) => {
                    console.log("result--->>", JSON.stringify(result));
                    sendResponse.poolData = result
                }).catch((e) => {
                    return res.status(400).send(response({}, "Something went wrong.!!!", false))
                })


            await JoinContestsSchema.aggregate([
                {
                    $match: {
                        "league_id": parseInt(params.league_id), "poolid": ObjectId(params.pool_id),
                    }
                },
                {
                    $lookup:
                    {
                        from: "user_players_ckts" + dbkey,
                        localField: "uteamid",
                        foreignField: "uteamid",
                        as: "userteam"
                    }
                },
                { $unwind: "$userteam" },
                {
                    $lookup:
                    {
                        from: "cktteamfantpoints",
                        localField: "userteam.team_id",
                        foreignField: "team_id",
                        as: "fantasypnt"
                    }
                },
                {
                    $unwind: {
                        "path": "$fantasypnt",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                // { $unwind: "$fantasypnt" },
                {
                    $group: {
                        "_id": { "team_no": "$userteam.team_no" },
                        // "_id": { "userid": "$userid" },
                        jpoolid: { $first: "$_id" },
                        userid: { $first: "$userid" },
                        uteamid: { $first: "$uteamid" },
                        league_id: { $first: "$league_id" },
                        // team_no: { $first: "$userteam.team_no" },
                        poolid: { $first: "$poolid" },
                        "totalpnt": { $sum: "$fantasypnt.tp" }
                    }
                },
                // {
                //     $group: {
                //         "_id": { "userid": "$userid" }, jpoolid: { $first: "$_id" }, userid: { $first: "$userid" }, uteamid: { $first: "$uteamid" }, league_id: { $first: "$league_id" },
                //         poolid: { $first: "$poolid" },
                //         "totalpnt": { $sum: "$fantasypnt.tp" }
                //     }
                // },
                { "$sort": { "totalpnt": -1 } }
            ]).then(async (result) => {
                sendResponse.leaderBoardData = result

                sendResponse.leaderBoardData = await Promise.all(sendResponse.leaderBoardData.map(async function (item) {
                    return new Promise(async (resolve, reject) => {
                        try {
                            let profile_detail = await db.Userprofile.findOne({ where: { userid: item.userid } })
                            item.name = profile_detail ? profile_detail.name : null;

                            if (profile_detail?.profilepic != "" && profile_detail?.profilepic != null) {
                                let checkhttpurl = profile_detail?.profilepic?isValidHttpUrl(profile_detail.profilepic):null;
                                if (checkhttpurl) {
                                    item.profilepic = profile_detail.profilepic
                                } else {
                                    item.profilepic = `${env.awsimgurl}profile_doc/${profile_detail?.profilepic}`
                                }
                                //  user_image = config.profile_url + user.user_profile.profilepic;
                            }

                            // item.profilepic = `${env.awsimgurl}profile_doc/${profile_detail?.profilepic}`
                            // item.name = profile_detail ? profile_detail.name : null;
                            // item.profilepic = profile_detail ? profile_detail.profilepic : null;
                            // item.teamname = profile_detail ? profile_detail.teamname : null;
                            resolve(item)
                        } catch (e) {

                        }
                    })
                }))
            }).catch((e) => {
                return res.status(400).send(response({}, "Something went wrong.!!!", false))
            })


            // let findData = await cktteams.find({ cid: params.league_id },

            // )

            let leagueDetail = await CktLeaguesSchema.findOne({ cid: params.league_id })

            let leagueMeta = await CktSeriesMetaDataSchema.findOne({ "league_id": params.league_id })


            letSendTeamData = {

            }


            sendResponse.matchDetail = {
                title: leagueDetail.name,
                logo_url: (leagueMeta.logo_url) ? `${env.awsimgurl}profile_doc/${leagueMeta?.logo_url}` : `${env.awsimgurl}profile_doc/${leagueDetail?.logo_url}`,

            }


            let date_start_new = await CktLeaguesSchema.findOne({ cid: params.league_id })
            let date_start = date_start_new?.date_start
            sendResponse.matchDetail.date_start = date_start

            return res.send(response(sendResponse, "Data found succesfully.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    series_fb_pool_detail: async (req, res, next) => {
        try {
            const footballDbConnection = await connectWithFootballDb();
            const FbLeaguesSchema = createFbLeaguesModel(footballDbConnection);
            const FbTeamsSchema = createFbTeamsModel(footballDbConnection);

            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const JoinContestsSchema = createSeriesJoinContestsModel(vendorDbConnection);
            const PoolSchema = createPoolModel(vendorDbConnection);

            let db = (await sdb())[global.gdbname[req.user.apikey]];
            const params = req.body;
            let limit = (req.query.page != undefined) ? parseInt(req.query.limit) : 4;
            let page = (req.query.page != undefined) ? parseInt(req.query.page) : 0;
            let skip = page * limit;
            let dbkey = keyGen(req.user.apikey);

            let sendResponse = {
                poolData: '',
                leaderBoardData: '',
                matchDetail: '',
                myLeaderBoardData: ''
            }
            let where = {
                league_id: parseInt(params.league_id)
            }
            await PoolSchema.aggregate(
                [
                    {
                        $match: { "_id": ObjectId(params.pool_id) }
                    },
                    { $project: { _id: 1, pmin: 1, pmax: 1, pamount: 1 } },

                    {
                        $lookup:
                        {
                            from: "pool_prize_breaks",
                            localField: "_id",
                            foreignField: "pool_id",
                            as: "poolbreakpoint",
                        },
                    },
                ]).then((result) => {
                    sendResponse.poolData = result
                }).catch((e) => {
                    return res.status(400).send(response({}, "Something went wrong.!!!", false))
                })


            await JoinContestsSchema.aggregate([
                {
                    $match: { "league_id": parseInt(params.league_id), "poolid": ObjectId(params.pool_id), }
                },
                {
                    $lookup:
                    {
                        from: "user_players_fb" + dbkey,
                        localField: "uteamid",
                        foreignField: "uteamid",
                        as: "userteam"
                    }
                },
                { $unwind: "$userteam" },
                {
                    $lookup:
                    {
                        from: "fbplyrfantpoints",
                        localField: "userteam.team_id",
                        foreignField: "team_id",
                        as: "fantasypnt"
                    }
                },
                {
                    $unwind: {
                        "path": "$fantasypnt",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                // { $unwind: "$fantasypnt" },
                {
                    $group: {
                        "_id": { "team_no": "$userteam.team_no" },
                        // "_id": { "userid": "$userid" },
                        jpoolid: { $first: "$_id" },
                        userid: { $first: "$userid" },
                        uteamid: { $first: "$uteamid" },
                        league_id: { $first: "$league_id" },
                        // team_no: { $first: "$userteam.team_no" },
                        poolid: { $first: "$poolid" },
                        "totalpnt": { $sum: "$fantasypnt.tp" }
                    }
                },

                { "$sort": { "totalpnt": -1 } }
            ]).then(async (result) => {
                sendResponse.leaderBoardData = result

                sendResponse.leaderBoardData = await Promise.all(sendResponse.leaderBoardData.map(async function (item) {
                    return new Promise(async (resolve, reject) => {
                        try {
                            let profile_detail = await db.Userprofile.findOne({ where: { userid: item.userid } })
                            item.name = profile_detail ? profile_detail.name : null;

                            if (profile_detail?.profilepic != "" && profile_detail?.profilepic != null) {
                                let checkhttpurl = profile_detail?.profilepic?isValidHttpUrl(profile_detail.profilepic):null;
                                if (checkhttpurl) {
                                    item.profilepic = profile_detail?.profilepic
                                } else {
                                    item.profilepic = `${env.awsimgurl}profile_doc/${profile_detail?.profilepic}`
                                }
                                //  user_image = config.profile_url + user.user_profile.profilepic;
                            }

                            //  item.profilepic = `${env.awsimgurl}profile_doc/${profile_detail?.profilepic}`

                            resolve(item)
                        } catch (e) {

                        }
                    })
                }))
            }).catch((e) => {
                return res.status(400).send(response({}, "Something went wrong.!!!", false))

            })

            let findData = await FbTeamsSchema.find({ cid: params.league_id },
                // { teama: 1, teamb: 1 }
            )



            letSendTeamData = {

            }
            findData.map((item) => {

                sendResponse.matchDetail = {
                    teama: item.team.title,
                    teamlogo: item.team.logo_url,
                    // teamb: item.teamb.team.title,
                    // teamblogo: item.teamb.team.thumb_url,
                }
            })
            let date_start_new = await FbLeaguesSchema.findOne({ season_id: params.league_id })
            let date_start = date_start_new?.date_start
            sendResponse.matchDetail.date_start = date_start

            return res.send(response(sendResponse, "Data found succesfully.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },

    pool_detail: async (req, res, next) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);
            const CricketPlayersSchema = createCricketPlayersModel(cktDbConnection);

            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const JoinMatchContestsSchema = createJoinMatchContestsModel(vendorDbConnection);
            const PoolSchema = createPoolModel(vendorDbConnection);
            const PoolPrizeBreaksSchema = createPoolPrizeBreaksModel(vendorDbConnection);

            let db = (await sdb())[global.gdbname[req.user.apikey]];

            const params = req.body;
            params.userid = req.user.id;//313
            let limit = (req.query.page != undefined) ? parseInt(req.query.limit) : 4;
            let page = (req.query.page != undefined) ? parseInt(req.query.page) : 0;
            let skip = page * limit;
            // let where = {

            //     id_: ObjectId(params.pool_id)
            // }
            let sendResponse = {
                poolData: '',
                leaderBoardData: '',
                matchDetail: '',
                // myLeaderBoardData: ''
            }
            let where = {
                match_id: parseInt(params.match_id)
            }
            await PoolSchema.aggregate(
                [
                    {
                        $match: { "_id": ObjectId(params.pool_id) }
                    },

                    {
                        $lookup:
                        {
                            from: "pool_prize_breaks",
                            localField: "_id",
                            foreignField: "pool_id",
                            as: "poolbreakpoint",
                            pipeline: [
                                { "$sort": { "pmax": 1 } }
                            ]
                        },
                    },
                    { $project: { _id: 1, joinfee: 1, totalwinamt: 1, winners: 1, maxteams: 1, c: 1, m: 1, s: 1, status: 1, favpool: 1, isChecked: 1, contest_id: 1, poolmaster_id: 1, match_id: 1, type: 1, isprivate: 1, iscpy: 1, ispoolfull: 1, iscancel: 1, countrytype: 1, gtype: 1, uptojoin: 1, joineduser: 1, 'poolbreakpoint._id': 1, 'poolbreakpoint.pmin': 1, 'poolbreakpoint.pmax': 1, 'poolbreakpoint.pamount': 1, } },

                ]).then(async (result) => {

                    let poolDetails = result[0];

                    let poolbreakpoint = poolDetails.poolbreakpoint;//pArr

                    let sm = 0;
                    poolbreakpoint.map((item) => {
                        sm = sm + item["pamount"];
                        return sm;
                    })
                    result[0]["totalwinamt"] = sm;

                    let currentBrkPoints = [];
                    if (poolDetails.c === 0 && poolDetails.joineduser >= 2) {

                        let pzBkIndex = poolbreakpoint.length - 1;
                        let maxRank = poolbreakpoint[pzBkIndex]["pmax"];////
                        let currentMax = poolDetails.joineduser;
                        let totalMax = poolDetails.maxteams;
                        let currentRank = (maxRank * currentMax) / totalMax;

                        let maxPoolPz = sm; //poolDetails.totalwinamt;

                        let currentPoolPz = (maxPoolPz / (poolDetails.joinfee * poolDetails.maxteams)) * (poolDetails.joinfee * poolDetails.joineduser); //maxPoolPz*currentRank/totalMax;
                        result[0]["ftotalwinamt"] = currentPoolPz;

                        let sumChkWCPPz = 0;

                        let sumUseAmt = 0;
                        let remainAmt = currentPoolPz;
                        poolbreakpoint.forEach((itemPB, indexPB) => {
                            let objPB = { ...itemPB };

                            let rnkAmt = itemPB["pamount"];

                            sumChkWCPPz = sumChkWCPPz + rnkAmt;
                            if (remainAmt > 0) {

                                if (currentPoolPz >= sumChkWCPPz) {

                                    remainAmt = remainAmt - itemPB["pamount"];
                                    sumUseAmt = sumUseAmt + itemPB["pamount"];
                                    currentBrkPoints.push(itemPB);
                                } else {

                                    let rngCnt = itemPB["pmax"] + 1 - itemPB["pmin"];
                                    let lastCnt = (rngCnt * itemPB["pamount"]) / maxPoolPz;
                                    lastCnt = (lastCnt) ? lastCnt.toString() : "";
                                    let cSplit = lastCnt.split(".");

                                    let cR1 = (cSplit[0]) ? parseInt(cSplit[0]) : 0;
                                    let cR2 = (cSplit[1]) ? parseFloat(cSplit[1]) : 0;

                                    let perAmt = itemPB["pamount"] / rngCnt;

                                    let rngLmt = remainAmt / perAmt;
                                    rngLmt = (rngLmt) ? rngLmt.toString() : "";
                                    let rLSplit = rngLmt.split(".");

                                    let cRL1 = (rLSplit[0]) ? parseInt(rLSplit[0]) : 0;
                                    let cRL2 = (rLSplit[1]) ? parseFloat(rLSplit[1]) : 0;
                                    let irngLmt = parseFloat(rngLmt);
                                    objPB["pmax"] = (irngLmt > rngCnt) ? rngCnt + objPB["pmin"] : (cRL1 === 0 ? objPB["pmin"] : cRL1 + objPB["pmin"] - 1);
                                    objPB["pamount"] = (irngLmt > rngCnt) ? rngCnt * perAmt : (cRL1 === 0 ? remainAmt : cRL1 * perAmt);
                                    remainAmt = remainAmt - objPB["pamount"];

                                    sumUseAmt = sumUseAmt + objPB["pamount"];
                                    currentBrkPoints.push(objPB);

                                    if (cRL1 > 0 && cRL2 > 0 && remainAmt > 0) {
                                        remainAmt = 0;
                                        let nxt = objPB["pmax"] + 1;
                                        let nxtAmt = currentPoolPz - sumUseAmt;
                                        let lastRng = { "_id": itemPB["_id"], "pmin": nxt, "pmax": nxt, "pamount": nxtAmt };
                                        currentBrkPoints.push(lastRng);
                                    }
                                }
                            }

                        })
                        result[0]["flexiblePool"] = currentBrkPoints;
                    } else {
                        result[0]["ftotalwinamt"] = sm;
                        result[0]["flexiblePool"] = poolDetails.poolbreakpoint;
                    }
                    /////////////////////

                    sendResponse.poolData = result;

                }).catch((e) => {

                    response({}, "Something went wrong222.!!!", false, null, e.stack)
                    // return resolve(e);
                })


            let dbkey = keyGen(req.user.apikey);
            await JoinMatchContestsSchema.aggregate([
                {
                    $match: { "match_id": parseInt(params.match_id), "poolid": ObjectId(params.pool_id) }
                },
                {
                    $lookup:
                    {
                        from: "user_player_match_ckts",
                        localField: "uteamid",
                        foreignField: "uteamid",
                        as: "userteam"
                    }
                },
                { $unwind: "$userteam" },

                {
                    $lookup:
                    {
                        from: "plyrfantpoints",
                        localField: "userteam.pid",
                        foreignField: "pid",
                        as: "fantasypnt",
                        pipeline: [
                            { $match: { "match_id": parseInt(params.match_id) } },
                        ]
                    }
                },
                {
                    $unwind: {
                        "path": "$fantasypnt",
                        "preserveNullAndEmptyArrays": true
                    }
                },


                {
                    $group: {
                        // "_id": { "userid": "$userid" }, 
                        "_id": { "_id": "$_id" }, team_no: { $first: "$userteam.team_no" }, jpoolid: { $first: "$_id" }, userid: { $first: "$userid" }, uteamid: { $first: "$uteamid" }, match_id: { $first: "$match_id" },
                        poolid: { $first: "$poolid" },
                        //"totalpnt": { $sum: "$fantasypnt.tp" }
                    }
                },
                { "$sort": { "totalpnt": -1 } }
            ])
                .then(async (result) => {


                    /////////////////////
                    if (params.status != 1) {



                        let rankArray = [];
                        // populating the rank array with the marks
                        for (let i = 0; i < result.length; i++) {
                            rankArray[i] = result[i]['totalpnt'];
                        }
                        let amtRankPerUser = [];
                        if (params.status == 3) {
                            let getMaxRank = await PoolPrizeBreaksSchema.find({
                                pool_id: params.pool_id
                            }).sort({ pmax: 1 });
                            getMaxRank.forEach((itemAmt) => {
                                let objAmtRankPerUser = {};
                                let totalUser = itemAmt["pmax"] - itemAmt["pmin"] + 1;
                                let perAmt = Math.round((itemAmt["pamount"] / totalUser) * 100) / 100;

                                objAmtRankPerUser["jpoolid"] = itemAmt["jpoolid"];
                                objAmtRankPerUser["pmin"] = itemAmt["pmin"];
                                objAmtRankPerUser["pmax"] = itemAmt["pmax"];
                                objAmtRankPerUser["pamount"] = itemAmt["pamount"];
                                objAmtRankPerUser["pool_id"] = itemAmt["pool_id"];
                                objAmtRankPerUser["peramt"] = perAmt;
                                amtRankPerUser.push(objAmtRankPerUser);
                            })
                        }
                        // passing the rank array and the playersFantasyset to the giveRank() function
                        let rankList = await giveRank(rankArray, result, amtRankPerUser);
                        let finalResult = [];
                        if (rankList && rankList.length > 0) {

                            for (a = 1; a <= rankList.length;) {
                                let filterRankWin = rankList.filter(x => x.position == a);

                                a++;
                                let sumAmt = 0;
                                for (b = 0; b < filterRankWin.length; b++) {

                                    sumAmt = sumAmt + filterRankWin[b]["peramt"];
                                }
                                let fAmt = sumAmt / filterRankWin.length;

                                for (c = 0; c < filterRankWin.length; c++) {
                                    filterRankWin[c]["famt"] = fAmt;
                                    finalResult.push(filterRankWin[c])

                                }
                            }


                        }
                    }
                    //////////////////////////
                    sendResponse.leaderBoardData = result

                    // sendResponse.finalResult = finalResult
                    let leaderBoardData = [];
                    let myleaderBoardData = [];
                    await Promise.all(sendResponse.leaderBoardData.map(async function (item) {
                        return new Promise(async (resolve, reject) => {
                            try {


                                let profile_detail = await db.Userprofile.findOne({ where: { userid: item.userid } })


                                item.name = profile_detail ? profile_detail.name : "";
                                item.email = profile_detail ? profile_detail.email : "";
                                // item.profilepic = profile_detail ? profile_detail.profilepic : null;
                                if (profile_detail?.profilepic != "" && profile_detail?.profilepic != null) {
                                    let checkhttpurl = profile_detail?.profilepic?isValidHttpUrl(profile_detail.profilepic):null;
                                    if (checkhttpurl) {
                                        item.profilepic = profile_detail?.profilepic
                                    } else {
                                        item.profilepic = `${env.awsimgurl}profile_doc/${profile_detail?.profilepic}`
                                    }
                                    //  user_image = config.profile_url + user.user_profile.profilepic;
                                }

                                // let profilepic = (profile_detail && profile_detail.profilepic) ? (`${env.awsimgurl}profile_doc/${profile_detail?.profilepic}`) : "";
                                // item.profilepic = profilepic;
                                // item.teamname = profile_detail ? profile_detail.teamname : null;

                                if (item.userid == params.userid) {
                                    myleaderBoardData.push(item)
                                } else {
                                    leaderBoardData.push(item)
                                }
                                resolve(item)
                            } catch (e) {

                            }
                        })
                    }))
                    sendResponse.leaderBoardData = leaderBoardData;
                    sendResponse["myleaderBoardData"] = myleaderBoardData;

                }).catch((e) => {

                    return res.status(400).send(response({}, "Something went wrong11.!!!", false))
                    // return resolve(e);
                })


            let findData = await CricketPlayersSchema.find(where, { teama: 1, teamb: 1 })

            letSendTeamData = {};// Todo: Not using

            findData.map((item) => {
                sendResponse.matchDetail = {
                    teama: item.teama.team.title,
                    teamalogo: item.teama.team.thumb_url,
                    teamb: item.teamb.team.title,
                    teamblogo: item.teamb.team.thumb_url,
                    teama_id: item?.teama?.team_id,
                    teamb_id: item?.teamb?.team_id,
                }
            })

            let date_start_new = await UpcomingCricketsSchema.findOne(where)
            let date_start = date_start_new?.date_start_ist
            sendResponse.matchDetail.date_start = date_start

            if (sendResponse.matchDetail) {
                const cktDbConnection = await connectWithCricketDb();
                const CktTeamMetaDataSchema = createCktTeamMetaDataModel(cktDbConnection);

                let teammetadata = await CktTeamMetaDataSchema.find({ "team_id": { "$in": [sendResponse.matchDetail.teama_id, sendResponse.matchDetail.teamb_id] } });

                let TeamList = teammetadata?.map(item => {
                    return {
                        teamLogo: `${env.awsimgurl}profile_doc/${item.logo_url}`
                    }
                }
                )
                if (TeamList.length > 0) {
                    if (TeamList[0].teamLogo) {
                        sendResponse.matchDetail.teamalogo = TeamList[0].teamLogo ? TeamList[0].teamLogo : "";
                    }
                    if (TeamList[1]?.teamLogo) {
                        sendResponse.matchDetail.teamblogo = TeamList[1].teamLogo ? TeamList[1].teamLogo : "";
                    }
                }
            }

            sendResponse.matchDetail["date_start"] = dateTimeZone(sendResponse.matchDetail["date_start"], req.user.timezone);//timeChange(req.user.id,sendResponse.matchDetail["date_start"])
            return res.send(response(sendResponse, "Data found succesfully.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong333.!!!", false, null, error.stack));
        }
    },
    fb_pool_detail: async (req, res, next) => {
        try {
            const footballDbConnection = await connectWithFootballDb();
            const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);
            const FbPlayersSchema = createFbPlayersModel(footballDbConnection);

            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const JoinMatchContestsSchema = createJoinMatchContestsModel(vendorDbConnection);
            const PoolSchema = createPoolModel(vendorDbConnection);

            let db = (await sdb())[global.gdbname[req.user.apikey]];
            const params = req.body;
            let limit = (req.query.page != undefined) ? parseInt(req.query.limit) : 4;
            let page = (req.query.page != undefined) ? parseInt(req.query.page) : 0;
            let skip = page * limit;
            let dbkey = keyGen(req.user.apikey);


            let sendResponse = {
                poolData: '',
                leaderBoardData: '',
                matchDetail: '',
                // myLeaderBoardData: ''
            }
            let where = {
                match_id: parseInt(params.match_id)
            }
            await PoolSchema.aggregate(
                [
                    {
                        $match: { "_id": ObjectId(params.pool_id) }
                    },

                    {
                        $lookup:
                        {
                            from: "pool_prize_breaks",
                            localField: "_id",
                            foreignField: "pool_id",
                            as: "poolbreakpoint",


                        },


                    },
                    { $project: { _id: 1, joinfee: 1, totalwinamt: 1, winners: 1, maxteams: 1, c: 1, m: 1, s: 1, status: 1, favpool: 1, isChecked: 1, contest_id: 1, poolmaster_id: 1, match_id: 1, type: 1, isprivate: 1, iscpy: 1, ispoolfull: 1, iscancel: 1, countrytype: 1, gtype: 1, uptojoin: 1, joineduser: 1, 'poolbreakpoint._id': 1, 'poolbreakpoint.pmin': 1, 'poolbreakpoint.pmax': 1, 'poolbreakpoint.pamount': 1, } },

                ]).then((result) => {
                    let poolDetails = result[0];

                    let arrObj = [];

                    let currentBrkPoints = [];

                    if (poolDetails.c === 0 && poolDetails.joineduser >= 2) {


                        let poolbreakpoint = poolDetails.poolbreakpoint;//pArr

                        let sm = 0;
                        poolbreakpoint.map((item) => {
                            sm = sm + item["pamount"];
                            return sm;
                        })

                        let pzBkIndex = poolbreakpoint.length - 1;
                        let maxRank = poolbreakpoint[pzBkIndex]["pmax"];////
                        let currentMax = poolDetails.joineduser;
                        let totalMax = poolDetails.maxteams;
                        let currentRank = (maxRank * currentMax) / totalMax;

                        let maxPoolPz = sm; //poolDetails.totalwinamt;

                        let currentPoolPz = (maxPoolPz / (poolDetails.joinfee * poolDetails.maxteams)) * (poolDetails.joinfee * poolDetails.joineduser); //maxPoolPz*currentRank/totalMax;

                        let sumChkWCPPz = 0;

                        let sumUseAmt = 0;
                        let remainAmt = currentPoolPz;
                        poolbreakpoint.forEach((itemPB, indexPB) => {
                            let objPB = { ...itemPB };

                            let rnkAmt = itemPB["pamount"];

                            sumChkWCPPz = sumChkWCPPz + rnkAmt;
                            if (remainAmt > 0) {
                                if (currentPoolPz >= sumChkWCPPz) {

                                    remainAmt = remainAmt - itemPB["pamount"];
                                    sumUseAmt = sumUseAmt + itemPB["pamount"];
                                    currentBrkPoints.push(itemPB);
                                } else {

                                    let rngCnt = itemPB["pmax"] + 1 - itemPB["pmin"];
                                    let lastCnt = (rngCnt * itemPB["pamount"]) / maxPoolPz;
                                    lastCnt = (lastCnt) ? lastCnt.toString() : "";
                                    let cSplit = lastCnt.split(".");

                                    let cR1 = (cSplit[0]) ? parseInt(cSplit[0]) : 0;
                                    let cR2 = (cSplit[1]) ? parseFloat(cSplit[1]) : 0;

                                    let perAmt = itemPB["pamount"] / rngCnt;

                                    let rngLmt = remainAmt / perAmt;
                                    rngLmt = (rngLmt) ? rngLmt.toString() : "";
                                    let rLSplit = rngLmt.split(".");

                                    let cRL1 = (rLSplit[0]) ? parseInt(rLSplit[0]) : 0;
                                    let cRL2 = (rLSplit[1]) ? parseFloat(rLSplit[1]) : 0;
                                    let irngLmt = parseFloat(rngLmt);
                                    objPB["pmax"] = (irngLmt > rngCnt) ? rngCnt + objPB["pmin"] : (cRL1 === 0 ? objPB["pmin"] : cRL1 + objPB["pmin"] - 1);


                                    objPB["pamount"] = (irngLmt > rngCnt) ? rngCnt * perAmt : (cRL1 === 0 ? remainAmt : cRL1 * perAmt);
                                    remainAmt = remainAmt - objPB["pamount"];

                                    sumUseAmt = sumUseAmt + objPB["pamount"];
                                    currentBrkPoints.push(objPB);

                                    if (cRL1 > 0 && cRL2 > 0 && remainAmt > 0) {
                                        remainAmt = 0;
                                        let nxt = objPB["pmax"] + 1;
                                        let nxtAmt = currentPoolPz - sumUseAmt;
                                        let lastRng = { "_id": itemPB["_id"], "pmin": nxt, "pmax": nxt, "pamount": nxtAmt };
                                        currentBrkPoints.push(lastRng);
                                    }
                                }
                            }

                        })
                        result[0]["flexiblePool"] = currentBrkPoints;
                    } else {
                        result[0]["ftotalwinamt"] = sm;
                        result[0]["flexiblePool"] = poolDetails.poolbreakpoint;
                    }
                    /////////////////////

                    sendResponse.poolData = result
                }).catch((e) => {

                    return res.status(400).send(response({}, "Something went wrong.!!!", false))
                    // return resolve(e);
                })

            await JoinMatchContestsSchema.aggregate([
                {
                    $match: {
                        "match_id": parseInt(params.match_id), "poolid": ObjectId(params.pool_id),
                    }
                },
                {
                    $lookup:
                    {
                        from: "user_player_match_fbs",
                        localField: "uteamid",
                        foreignField: "uteamid",
                        as: "userteam"
                    }
                },
                { $unwind: "$userteam" },
                {
                    $lookup:
                    {
                        from: "fbplyrfantpoints",
                        localField: "userteam.pid",
                        foreignField: "pid",
                        as: "fantasypnt",
                        pipeline: [
                            { $match: { "match_id": parseInt(params.match_id) } },
                        ]
                    }
                },
                {
                    $unwind: {
                        "path": "$fantasypnt",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                // { $unwind: "$fantasypnt" },
                {
                    $group: {
                        //"_id": { "team_no": "$userteam.team_no" },
                        // "_id": { "userid": "$userid" },
                        "_id": { "uteamid": "$uteamid" },
                        jpoolid: { $first: "$_id" },
                        userid: { $first: "$userid" },
                        uteamid: { $first: "$uteamid" },
                        match_id: { $first: "$match_id" },
                        // team_no: { $first: "$userteam.team_no" },
                        // poolid: { $first: "$poolid" },
                        "totalpnt": { $sum: "$fantasypnt.tp" }
                    }
                },

                // {
                //     $group: {
                //         "_id": { "userid": "$userid" }, jpoolid: { $first: "$_id" }, userid: { $first: "$userid" }, uteamid: { $first: "$uteamid" }, match_id: { $first: "$match_id" },
                //         poolid: { $first: "$poolid" },
                //         "totalpnt": { $sum: "$fantasypnt.tp" }
                //     }
                // },
                { "$sort": { "totalpnt": -1 } }
            ]).then(async (result) => {

                sendResponse.leaderBoardData = result
                let leaderBoardData = [];
                let myleaderBoardData = [];
                sendResponse.leaderBoardData = await Promise.all(sendResponse.leaderBoardData.map(async function (item) {

                    return new Promise(async (resolve, reject) => {
                        try {
                            let profile_detail = await db.Userprofile.findOne({ where: { userid: item.userid } })
                            item.name = profile_detail ? profile_detail.name : null;
                            // item.profilepic = profile_detail ? profile_detail.profilepic : null;
                            if (profile_detail?.profilepic != "" && profile_detail?.profilepic != null) {
                                let checkhttpurl = profile_detail?.profilepic?isValidHttpUrl(profile_detail.profilepic):null;
                                if (checkhttpurl) {
                                    item.profilepic = profile_detail.profilepic
                                } else {
                                    item.profilepic = `${env.awsimgurl}profile_doc/${profile_detail?.profilepic}`
                                }
                                //  user_image = config.profile_url + user.user_profile.profilepic;
                            }

                            if (item.userid == params.userid) {
                                myleaderBoardData.push(item)
                            } else {
                                leaderBoardData.push(item)
                            }
                            // item.profilepic = `${env.awsimgurl}profile_doc/${profile_detail?.profilepic}`
                            // item.name = profile_detail ? profile_detail.name : null;
                            // item.profilepic = profile_detail ? profile_detail.profilepic : null;
                            // item.teamname = profile_detail ? profile_detail.teamname : null;
                            resolve(item)
                        } catch (e) {

                        }
                    })
                }))

                sendResponse.leaderBoardData = leaderBoardData;
                sendResponse["myleaderBoardData"] = myleaderBoardData;
            }).catch((e) => {

                return res.status(400).send(response({}, "Something went wrong.!!!", false))

            })

            let findData = await FbPlayersSchema.find(where, { teama: 1, teamb: 1 })

            // letSendTeamData = {

            // }
            findData.map((item) => {
                sendResponse.matchDetail = {
                    teama: item.teama.team.title,
                    teamalogo: item.teama.team.logo_url,
                    teamb: item.teamb.team.title,
                    teamblogo: item.teamb.team.logo_url,
                    teama_id: item?.teama?.team_id,
                    teamb_id: item?.teamb?.team_id,
                }
            })

            let date_start_new = await FbUpcomingsSchema.findOne(where)
            let date_start = date_start_new?.date_start
            sendResponse.matchDetail.date_start = date_start
            return res.send(response(sendResponse, "Data found succesfully.!!!", true))

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }


    },



    join_pool_contest: async (req, res, next) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);

            const footballDbConnection = await connectWithFootballDb();
            const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);

            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const ContestSeriesSchema = createContestSeriesModel(vendorDbConnection);
            const JoinMatchContestsSchema = createJoinMatchContestsModel(vendorDbConnection);
            const JoinContestsSchema = createSeriesJoinContestsModel(vendorDbConnection);
            const PoolSchema = createPoolModel(vendorDbConnection);
            const UsersSchema = createUsersModel(vendorDbConnection);
            const TransactionsSchema = createTransactionsModel(vendorDbConnection);

            
            let params = req.body;
            params.userid = req.user.id;
            console.log("params111---->>", params)
            // var contestid = new ObjectId(params.contest_id);
            //const findContest = await contestsSchema(req.user.apikey).find()
            if (params?.match_id) {
                let upcomingMatch = null;
                if (params.gametype === "ckt") {
                    upcomingMatch = UpcomingCricketsSchema;
                } else if (params.gametype === "fb") {
                    upcomingMatch = FbUpcomingsSchema;
                }
                let matchDetail = await upcomingMatch.findOne({ "match_id": params.match_id });
                let currentDates = currentTimeZoneDate() * 1 / 1000;
                let matchDate = matchDetail?.date_start_ist * 1 / 1000;

                if (matchDate < currentDates) {
                    return res.send(response({}, "Match is live now. You cannot join", false))
                }
            }
            if (params?.league_id) {
                let poolData = await PoolSchema.findOne({ _id: ObjectId(params.poolid) })

                let contestsSer = await ContestSeriesSchema.findOne({ "league_id": params?.league_id, "contest_id": ObjectId(poolData?.contest_id) });

                let currentDates = currentTimeZoneDate() * 1 / 1000;
                let matchDate = contestsSer?.date_start * 1 / 1000;

                if (matchDate < currentDates) {
                    return res.send(response({}, "Contest of league is live now. You cannot join", false))
                }
            }

            let gtype = "";
            let joinContSchema = null;
            if (params.match_id) {
                gtype = "mplycont";
                joinContSchema = JoinMatchContestsSchema;
            } else if (params.league_id) {
                gtype = "splycont";
                joinContSchema = JoinContestsSchema;
            }

            let checkjoin = await joinContSchema.findOne({ poolid: ObjectId(params.poolid), uteamid: ObjectId(params.uteamid) })

            if (checkjoin) {
                return res.send(response({}, "You already joined with this team, please join with another team.", false))
            }
            console.log("params--->>.", params);
            let pool_list = await PoolSchema.findOne({ _id: ObjectId(params.poolid) })
            console.log("pool_list===>>", pool_list);
            if (pool_list.iscancel === 1) {
                return res.send(response({}, "This pool is cancelled, please join another pool", false))
            }

            ///////////////////
            let maxteams = pool_list.maxteams;
            let currentCnt = (pool_list.joineduser) ? pool_list.joineduser + 1 : 1;

            if (maxteams >= currentCnt) {
                // let gameSettingsDetail = await gameSettingsSchema.findOne({ "key": "bnsused" })//Todo: Not using this
                const userDetail = await UsersSchema.findOne({ _id: ObjectId(params.userid) },
                {'walletbalance':1, 'wltbns':1, 'wltwin':1, 'totaljoinfee':1, 'totaljoinfeedepots':1, 'totaljoinfeewin':1, 'phone':1});
                console.log("req.user.userType-->>",req.user.userType);
                ////////////
                let calDeductBalResult = {};
                if (req.user.userType==2) {
                    let thirdWalletChk = await thirdWalletChkApi(req.user.apikey, userDetail["phone"], pool_list.joinfee, false);
                    calDeductBalResult.status = (thirdWalletChk.code === 200) ? true : false;
                    calDeductBalResult.remainingBal = thirdWalletChk.data.current_deposit;
                    calDeductBalResult.remainingBns = thirdWalletChk.data.current_bonus;
                    calDeductBalResult.remainingWin = thirdWalletChk.data.current_win;
                    calDeductBalResult.deductBal = thirdWalletChk.data.deduct_deposit;
                    calDeductBalResult.deductBns = thirdWalletChk.data.deduct_bonus;
                    calDeductBalResult.deductWin = thirdWalletChk.data.deduct_win;
                } else {
                    calDeductBalResult = await calDeductBal(pool_list.joinfee, pool_list.usable_bonus_percentage, userDetail["walletbalance"], userDetail["wltbns"], userDetail["wltwin"], params.userid, false, req,vendorDbConnection);
                }
                /////////////

                if (calDeductBalResult.status == true) {
                    let poolDataSave = () => {
                        return new Promise(async (resolve, reject) => {


                            console.log("calarrayBns--->>>", calDeductBalResult)
                            const UserBonusSchema = createUserBonusModel(vendorDbConnection);
                            if (req.user.apikey === "crdxn" && calDeductBalResult?.arrayBns?.length > 0) {
                                calDeductBalResult?.arrayBns?.forEach(async (itmBal) => {
                                    console.log("itmBal--->>", itmBal)
                                    await UserBonusSchema.updateOne({ "transid": ObjectId(itmBal.transid) },{ "balamt": itmBal.balamt });

                                })
                            }
                            //let currentCnt = (pool_list.joineduser) ? pool_list.joineduser + 1 : 1;
                            await PoolSchema.updateOne({ _id: params.poolid }, { "$set": { joineduser: currentCnt } })
                            params["pamount"] = pool_list.joinfee;
                            let resJoinCont = await joinContSchema.create(params)

                            if (resJoinCont._id) {
                                let jpoolID = resJoinCont._id.toString();

                                let sumTotalJoinFee = userDetail["totaljoinfee"] + pool_list.joinfee;
                                let sumTotalJoinFeeDepots = userDetail["totaljoinfeedepots"] + calDeductBalResult.deductBal;
                                let sumTotalJoinFeeWin = userDetail["totaljoinfeewin"] + calDeductBalResult.deductWin;

                                await UsersSchema.updateOne(
                                    {
                                        "_id": ObjectId(params.userid)
                                    },
                                    {"$set":{
                                        "walletbalance": calDeductBalResult.remainingBal, "wltbns": calDeductBalResult.remainingBns
                                        , "wltwin": calDeductBalResult.remainingWin, "totaljoinfee": sumTotalJoinFee, "totaljoinfeedepots": sumTotalJoinFeeDepots, "totaljoinfeewin": sumTotalJoinFeeWin
                                    }}
                                   
                                );

                                let deductBal = calDeductBalResult.deductBal;
                                let deductBns = calDeductBalResult.deductBns;
                                let deductWin = calDeductBalResult.deductWin;
                                //[plyacc, mplycont, buysell, splycont, tmacc, pzpool, tmcont, optn, longtrm, ipo]
                                let currentDate = currentTimeZoneDate() * 1 / 1000;
                                if (deductBal > 0) {
                                    let objTransBal = { "userid": params.userid, "amount": deductBal, "txdate": currentDate, "ttype": "dr", "gtype": gtype, "atype": "join_bal", "jpoolid": jpoolID };
                                    await TransactionsSchema(objTransBal);
                                }
                                if (deductBns > 0) {
                                    let objTransBns = { "userid": params.userid, "amount": deductBns, "txdate": currentDate, "ttype": "dr", "gtype": gtype, "atype": "join_bns", "jpoolid": jpoolID, "bnstring": calDeductBalResult.bnsTransString };
                                    await TransactionsSchema(objTransBns);
                                }
                                if (deductWin > 0) {
                                    let objTransBns = { "userid": params.userid, "amount": deductWin, "txdate": currentDate, "ttype": "dr", "gtype": gtype, "atype": "join_win", "jpoolid": jpoolID };
                                    await TransactionsSchema(objTransBns);
                                }
                                ///////////////
                                let liveEmitData = {
                                    "match_id": params.match_id, "type": "m", "fetch_latest": 1, "authorization": req.headers.authorization,"auth":1,
                                    "userid":req.user.id
                                }
                                let sktUrl = (params.gametype == "ckt") ? "my_match_cricket_pool_contest_list_v2" : "my_match_football_pool_contest_list_v2";
                                console.log("sktUrl-addplayer_list-->>",sktUrl,liveEmitData);
                                socketConnection()
                                socket.emit(sktUrl, liveEmitData);

                                //return res.send(response({}, "pool joined successfully.", true))
                                resolve(response({}, "pool joined successfully.", true));
                            } else {
                                //return res.send(response({}, "Something went wrong.", false))
                                resolve(response({}, "Something went wrong.", false));
                            }
                        })
                    }

                    poolDataSave().then((resultPool) => {
                        //socketDisconnect()
                        // setTimeout(() => {
                        if (params.match_id) {
                            let type = (params.gametype === "ckt") ? "cricket" : "football";
                            let status = 1;
                            let requestObj = {
                                match_id: params.match_id,
                                pool_id: params.poolid,
                                type,
                                status,
                                fetch_latest: 1,
                                "auth": 1,
                                "authorization": req.headers.authorization
                            }

                            // let liveEmitData = {
                            //     "match_id": params.match_id,
                            //     "type": "m",
                            //     "fetch_latest": 1,
                            //     "auth": 1,
                            //     "authorization": req.headers.authorization
                            // }

                            // socketConnection()
                            // socket.on('connect', () => {
                            //     console.log("------Connect-----", JSON.stringify(requestObj), JSON.stringify(liveEmitData))
                            //     socket.emit(`live_pool_data_v2`, requestObj);
                            //     let sktUrl = (type == "cricket") ? "match_cricket_pool_contest_list_v2" : "match_football_pool_contest_list_v2";
                            //     socket.emit(sktUrl, liveEmitData)
                            // });
                            let liveEmitData = {
                                "match_id": params.match_id, "type": "m", "fetch_latest": 1, "authorization": req.headers.authorization,"auth":1,
                                "userid":req.user.id
                            }
                            let sktUrl = (params.gametype == "ckt") ? "my_match_cricket_pool_contest_list_v2" : "my_match_football_pool_contest_list_v2";
                            console.log("sktUrl-addplayer_list-->>",sktUrl,liveEmitData);
                            socketConnection()
                            socket.emit(sktUrl, liveEmitData);

                        }
                        // }, 10000);
                        return res.send(resultPool);
                    })
                } else {
                    return res.send(response({}, "You don't have enough balance, please add an amount.", false))
                }

            } else {
                return res.send(response({}, "Pool is filled, please join with another pool.", false))
            }

            ///////////////////

        } catch (error) {

            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },

    prize_join_preview: async (req, res, next) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);

            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const PoolSchema = createPoolModel(vendorDbConnection);

            const params = req.body;
            console.log("params--->>", params)
            params.user_id=ObjectId(params.user_id);

            if (params?.match_id) {
                let matchDetail = await UpcomingCricketsSchema.findOne({ "match_id": params.match_id });

                let currentDates = currentTimeZoneDate() * 1 / 1000;
                let matchDate = matchDetail?.date_start_ist * 1 / 1000;
                if (matchDate < currentDates) {
                    return res.send(response({}, "Match is live now. You cannot join", false))
                }
            }


            let wherepool = {
                "_id": ObjectId(params.pool_id)
            }
            let findData = await PoolSchema.findOne(wherepool, { joinfee: 1, "usable_bonus_percentage": 1 })
            // const prize_preview = await UsersSchema.findOne({
            //     where: {
            //         id: params.user_id
            //     },
            //     attributes: ['walletbalance', 'wltbns'],
            // });
            // transaction_detail = transDes;
            // let transData = { transaction_detail, prize_preview }
            /////////////////////
             //let gameSettingsDetail = await gameSettingsSchema.findOne({ "key": "bnsused" }) // Todo: Not using

            
            const UsersSchema = createUsersModel(vendorDbConnection);
            const userDetail = await UsersSchema.findOne({ _id: params.user_id }, {'walletbalance':1, 'wltbns':1, 'wltwin':1, 'phone':1});
            console.log("req.user.userType-->>",req.user.userType,userDetail,findData)
           /////////////////////
            if (!userDetail) {
                return res.send(response({}, `Account doesn't exist.`, false))
            }
            if (!findData) {
                return res.send(response({}, `pool_id doesn't exist.`, false))
            }

            let sendResponse = {};

            
            if (req.user.userType==2) {
                let thirdWalletChk = await thirdWalletChkApi(req.user.apikey, userDetail["phone"], findData.joinfee, true);
                console.log("thirdWalletChk====>>", thirdWalletChk)
                sendResponse = {
                    joinfee: findData.joinfee,
                    walletbonous: thirdWalletChk.data.deduct_bonus,
                    walletbalance: thirdWalletChk.data.deduct_deposit,
                    walletwin: thirdWalletChk.data.deduct_win,
                    bnsperc: findData.usable_bonus_percentage,
                    is_bal: (thirdWalletChk.code === 200) ? true : false
                }

            } else {

                let calDeductBalResult = await calDeductBal(findData.joinfee, findData.usable_bonus_percentage, userDetail["walletbalance"], userDetail["wltbns"], userDetail["wltwin"], params.user_id, true,req, vendorDbConnection);
                console.log("calDeductBalResult=HH==>>", calDeductBalResult);

                if (calDeductBalResult.status == true) {
                    ////////////////////
                    sendResponse = {
                        joinfee: findData.joinfee,
                        walletbonous: calDeductBalResult.deductBns,
                        walletbalance: calDeductBalResult.deductBal,
                        walletwin: calDeductBalResult.deductWin,
                        bnsperc: findData.usable_bonus_percentage,
                        is_bal: calDeductBalResult.status
                    }
                    console.log("sendResponse--1->>", sendResponse)
                } else {
                    sendResponse = {
                        joinfee: findData.joinfee,
                        walletbonous: calDeductBalResult.deductBns,
                        walletbalance: calDeductBalResult.deductBal,
                        walletwin: calDeductBalResult.deductWin,
                        bnsperc: findData.usable_bonus_percentage,
                        is_bal: calDeductBalResult.status

                    }
                    console.log("sendResponse--2->>", sendResponse)
                }
            }
            //prize_preview.joinfee = findData[0].joinfee
            return res.send(response(sendResponse, `prize join preview succesfully`, true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },

    my_pool_contest_match_cricket: async (req, res, next) => {
        const dbName = req.user.dbName;
        const vendorDbConnection = await connectWithVendorDb(dbName);
        const JoinMatchContestsSchema = createJoinMatchContestsModel(vendorDbConnection);
        const UserPlayerMatchCktsSchema = createUserPlayerMatchCktsModel(vendorDbConnection);
        const UserTeamCktSchema = createUserTeamCktModel(vendorDbConnection);

        let matchReq = {
            match_id: req.body.match_id, 
            userid: ObjectId(req.user.id),
            gametype: "ckt"
        }
        let joinContSchema = JoinMatchContestsSchema,

            //newadd
            userTeamSchema = UserTeamCktSchema,
            userPlayerSchema = UserPlayerMatchCktsSchema,
            type = "m"
        let groupObject = {};
        groupObject["match_id"] = { $first: "$match_id" };
        my_pool_contest_list(req, res, next, matchReq, joinContSchema, groupObject, userTeamSchema, type, userPlayerSchema,vendorDbConnection)
    },
    my_pool_contest_match_football: async (req, res, next) => {
        const dbName = req.user.dbName;
        const vendorDbConnection = await connectWithVendorDb(dbName);
        const JoinMatchContestsSchema = createJoinMatchContestsModel(vendorDbConnection);
        const UserPlayerMatchFbsSchema = createUserPlayerMatchFbsModel(vendorDbConnection);
        const UserTeamFbSchema = createUserTeamFbModel(vendorDbConnection);

        let matchReq = {
            match_id: req.body.match_id, userid: ObjectId(req.user.id),
            gametype: "fb"
        }
        let joinContSchema = JoinMatchContestsSchema,
            //new add 
            userTeamSchema = UserTeamFbSchema,
            userPlayerSchema = UserPlayerMatchFbsSchema,
            type = "m"
        let groupObject = {};
        groupObject["match_id"] = { $first: "$match_id" };
        my_pool_contest_list(req, res, next, matchReq, joinContSchema, groupObject, userTeamSchema, type, userPlayerSchema,vendorDbConnection)
    },
    my_pool_contest_series_cricket: async (req, res, next) => {
        const dbName = req.user.dbName;
        const vendorDbConnection = await connectWithVendorDb(dbName);
        const JoinContestsSchema = createSeriesJoinContestsModel(vendorDbConnection);
        const UserPlayersCktSchema = createUserPlayersCktModel(vendorDbConnection);
        const UserCktLeagueSchema = createUserCktLeagueModel(vendorDbConnection);

        
        let matchReq = {
            league_id: req.body.league_id, 
            userid: ObjectId(req.user.id),
            gametype: "ckt"
        }
        let joinContSchema = JoinContestsSchema,
            //new ADD
            userTeamSchema = UserCktLeagueSchema,
            userPlayerSchema = UserPlayersCktSchema,
            type = "s"

        let groupObject = {};
        groupObject["league_id"] = { $first: "$league_id" };
        my_pool_contest_list(req, res, next, matchReq, joinContSchema, groupObject, userTeamSchema, type, userPlayerSchema,vendorDbConnection)
    },
    my_pool_contest_series_football: async (req, res, next) => {
        const dbName = req.user.dbName;
        const vendorDbConnection = await connectWithVendorDb(dbName);
        const JoinContestsSchema = createSeriesJoinContestsModel(vendorDbConnection);
        const UserPlayersFbSchema = createUserPlayersFbModel(vendorDbConnection);
        const UserFbLeagueSchema = createUserFbLeagueModel(vendorDbConnection);

        let matchReq = {
            league_id: req.body.league_id, 
            userid: ObjectId(req.user.id),
            gametype: "fb"
        }
        let joinContSchema = JoinContestsSchema,
            //new add
            userTeamSchema = UserFbLeagueSchema,
            userPlayerSchema = UserPlayersFbSchema
        type = "s"
        let groupObject = {};
        groupObject["league_id"] = { $first: "$league_id" };
        my_pool_contest_list(req, res, next, matchReq, joinContSchema, groupObject, userTeamSchema, type, userPlayerSchema,vendorDbConnection)
    },
    private_contest_size_list: async (req, res, next) => {
        const params = req.body;

        if (params.contest_size && params.contest_size > 1) {
            const connection = await connectWithGeneralDb();
            const PrivateContestWinsLabsSchema = createPrivateContestWinsLabsModel(connection);
            const PrivateContestSizesSchema = createPrivateContestSizesModel(connection);


            let contest_size = (params.contest_size && params.contest_size > 100) ? 100 : params.contest_size;
            let privContSiz = await PrivateContestSizesSchema.findOne({ "contestsize": contest_size });

            if (privContSiz) {
                let winnerslabArr = privContSiz.winnerslabs;
                let privContWinsLabs = await PrivateContestWinsLabsSchema.find({ "winner": { "$in": winnerslabArr } });
                return res.send(response({
                    contestsize: privContWinsLabs,
                    // status: true,
                }, "Contest size view succesfully.!!!", true))
            } else {
                return res.send(response({
                    // status: false,
                }, "Contest size is not available.", false))
            }
        } else {
            return res.send(response({
                // status: false,
            }, "Contest size should be at least 2.", false))
        }

    },
    private_contest_save: async (req, res, next) => {
        try {
            const params = req.body;
            // if( req.user.id ==0){   //gtype
            //    return res.send(response({}, "Temporarily stopped.", false))
            // } else {
            if (params.maxteams > settingDetail.maxteam) {
                return res.send(response({}, "Max " + settingDetail.maxteam + " teams allowed.", false))
            } else if (params.maxteams < params.winners) {
                return res.send(response({}, "Winners should be less than the max team.", false))
            } else {
                const dbName = req.user.dbName;
                const generalDbConnection = await connectWithGeneralDb();
                const SettingSchema = createSettingsModel(generalDbConnection);

                const vendorDbConnection = await connectWithVendorDb(dbName);
                const ContestsSchema = createContestsModel(vendorDbConnection);
                const PoolSchema = createPoolModel(vendorDbConnection);
                const PoolPrizeBreaksSchema = createPoolPrizeBreaksModel(vendorDbConnection);


                let settingsSchema = await SettingSchema.findOne();
                let usable_bonus_percentage = settingsSchema["usable_bonus_percentage"];
                let getContest = await ContestsSchema.findOne({ "isprivate": 1 });

                let contest_id=null;
                if(!(getContest?._id)){
                  let saveCont=  await ContestsSchema.updateOne({ "isprivate": 1 },
                    {"status" : 2,
                    "dis_val" : 5,
                    "favcontest" : 0,
                    "isprivate" : 1,
                    "sortodr" : 0,
                    "title" : "Private Contest",
                    "subtitle" : "Private Contest",
                    "contest_id" : "635b9fc71e3b10269415f7d8",
                    "order" : 0
                }, { "upsert": true });
                  
                  contest_id=saveCont?.upserted?.[0]?._id;
                }else{
                    contest_id = ObjectId(getContest._id);
                }
                console.log("contest_id--->>",contest_id);
                
                
                    
                    let privateuptojoin = settingDetail.privateuptojoin;
                    let getPool = await PoolSchema.create({ "isprivate": 1, "c": 0, "status": 1, "isChecked": 1, "countrytype": req.user.country_code, "createdby": ObjectId(req.user.id), "contest_id": contest_id, "uptojoin": privateuptojoin, "privatename": params.privatename, "maxteams": params.maxteams, "joinfee": params.joinfee, "winners": params.winners, "s": params.s, "m": params.m, "match_id": params.match_id, "totalwinamt": params.totalwinamt, "usable_bonus_percentage": usable_bonus_percentage, "isflexible": 1, "gtype": params.gtype, "type": "m" });

                    var poolId = getPool._id
                    // let privContSiz = await privateContestSizesSchema.create({ "contestsize": params.contest_size });

                    for (let i = 0; i < params.poolpb.length; i++) {
                        let createData = {
                            pool_id: poolId,
                            pmin: params.poolpb[i].pmin,
                            pmax: params.poolpb[i].pmax,
                            pamount: params.poolpb[i].pamount,

                        }
                        let d = await PoolPrizeBreaksSchema.create(createData)

                    }

                    req.body.isprivate = 1;
                    return await matchCricketPoolContestList(req, res);
                    //return res.send(response({}, "Private pool save successfully.", true))
                

            }
            //} 

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    poolprizebreaksave: async (req, res, next) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const PoolPrizeBreaksSchema = createPoolPrizeBreaksModel(vendorDbConnection);

            const params = req.body
            let dataPool;
            let dataPoolPrize;


            if (dataPoolPrize != null) {

                let sendData = {
                    pool_id: poolId,
                    ppbmaster_id: dataPoolPrize.poolmaster_id,
                    pmin: dataPoolPrize.pmin,
                    pmax: dataPoolPrize.pmax,
                    pamount: dataPoolPrize.pamount,
                    createdAt: dataPoolPrize.createdAt,
                    updatedAt: dataPoolPrize.updatedAt,
                }
                await PoolPrizeBreaksSchema.create(sendData);
            }


            return res.send(response(sendData, "Pool Update successfully.!!!", true))

        }

        catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }

    },
    series_private_contest_save: async (req, res, next) => {
        try {

            const params = req.body;
            return res.send(response({}, "Temporarily stopped.", false))
            // if (type == "s") {

            // date_start = params.date_start,
            //     date_end = params.date_end,
            //     gtype = params.gtype,
            //     league_id = params.league_id,
            //     session_id = params.session_id

            // }
            /*
            if (params.maxteams > settingDetail.maxteam) {
                return res.send(response({}, "Max " + settingDetail.maxteam + " teams allowed.", false))
            } else if (params.maxteams < params.winners) {
                return res.send(response({}, "Winners should be less than the max team.", false))
            } else {
                let getContest = await contestsSchema(req.user.apikey).findOne({ "isprivate": 1 });
                if (getContest && getContest._id) {
                    let contest_id = ObjectId(getContest._id);
                    params.contest_id = contest_id
                    let create_contest = await contestseries.create(params)
                    let privateuptojoin = settingDetail.privateuptojoin;
                    let getPool = await pool(req.user.apikey).create({ "isprivate": 1, "c": 1, "status": 1, "isChecked": 1, "countrytype": req.user.country_code, "createdby": req.user.id, "contest_id": contest_id, "uptojoin": privateuptojoin, "privatename": params.privatename, "maxteams": params.maxteams, "joinfee": params.joinfee, "winners": params.winners, "s": params.s, "m": params.m, type: params.type, gtype: params.gtype, league_id: params.league_id, "totalwinamt": params.totalwinamt, "start_date": params.date_start, "end_date": params.date_end });
                    var poolId = getPool._id
                    
                    for (let i = 0; i < params.poolpb.length; i++) {
                        let createData = {
                            pool_id: poolId,
                            pmin: params.poolpb[i].pmin,
                            pmax: params.poolpb[i].pmax,
                            pamount: params.poolpb[i].pamount,

                        }
                        
                        let d = await poolPrizebreakSchema.create(createData)
                        

                    }
                    return res.send(response({}, "Series Private pool save successfully.", true))
                } else {
                    return res.send(response({}, "Series Private contest is not created.", false))
                }
            }
            */
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    join_pool_series: async (req, res, next) => {
        // try {
        //     let params = req.body;
        //     // var contestid = new ObjectId(params.contest_id);
        //     const findContest = await contestseries.find()


        //     params.userid = req.user.id
        //     await joinSContSchema.create(params).then(async (result) => {

        //         // return res.send(response(team_list, "Team list find Successfully!.", true));
        //         return res.send(response({}, "pool joined successfully.", true))
        //     });
        // } catch (error) {
        //     return res.status(400).send(response({}, "Something went wrong.!!!", false))
        //     next(error)
        // }
        try {
            
            const generalDbConnection = await connectWithGeneralDb();
            const GameSettingsSchema = createGameSettingsModel(generalDbConnection);

            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const JoinContestsSchema = createSeriesJoinContestsModel(vendorDbConnection);
            const PoolSchema = createPoolModel(vendorDbConnection);
            const UsersSchema = createUsersModel(vendorDbConnection);
            const TransactionsSchema = createTransactionsModel(vendorDbConnection);
        

            let params = req.body;
            params.userid = req.user.id
            // var contestid = new ObjectId(params.contest_id);
            //const findContest = await contestsSchema(req.user.apikey).find()


            let pool_list = await PoolSchema.findOne({ _id: params.poolid })

            ///////////////////

            let gtype = "splycont";
            // let gameSettingsDetail = await GameSettingsSchema.findOne({ "key": "bnsused" })
            // const userDetail = await UsersSchema.findOne({
            //     where: { id: params.userid }, attributes: ['walletbalance', 'wltbns'],
            // });
            // let bnsFromFee = (userDetail["wltbns"] > 0) ? (pool_list.joinfee * (gameSettingsDetail.value) / 100) : 0;
            // let addWltbns = ((userDetail["wltbns"]) > 0) ? (userDetail["wltbns"] - (bnsFromFee)) : 0;
            // addWltbns = (addWltbns < 0) ? userDetail["wltbns"] : addWltbns;


            // let addWalBal = (userDetail["walletbalance"] > 0) ? (pool_list.joinfee - bnsFromFee) : 0;
            // let totalBal = userDetail["walletbalance"] + addWltbns;

            // let currentWalletbalance = userDetail["walletbalance"] - addWalBal;
            // let currentBnsbalance = userDetail["wltbns"] - bnsFromFee;

            // if (currentWalletbalance >= 0 && currentBnsbalance >= 0) {
            let gameSettingsDetail = await GameSettingsSchema.findOne({ "key": "bnsused" })
            const userDetail = await UsersSchema.findOne({ id: params.userid }, 
                {'walletbalance':1, 'wltbns':1, 'wltwin':1, 'totaljoinfee':1, 'totaljoinfeedepots':1, 
                    'totaljoinfeewin':1, 'phone':1});
            // let bnsFromFee = (userDetail["wltbns"] > 0) ? (pool_list.joinfee * (gameSettingsDetail.value) / 100) : 0;
            // let addWltbns = ((userDetail["wltbns"]) > 0) ? (userDetail["wltbns"] - (bnsFromFee)) : 0;
            // addWltbns = (addWltbns < 0) ? userDetail["wltbns"] : addWltbns;

            // let addWalBal = (userDetail["walletbalance"] > 0) ? (pool_list.joinfee - bnsFromFee) : 0;

            // let totalBalBns = (userDetail["walletbalance"] + bnsFromFee) - (pool_list.joinfee);

            // let currentWalletbalance = userDetail["walletbalance"] - addWalBal;
            // let currentBnsbalance = userDetail["wltbns"] - bnsFromFee;

            let calDeductBalResult = {};
            if (req.user.userType==2) {
                let thirdWalletChk = await thirdWalletChkApi(req.user.apikey, userDetail["phone"], pool_list.joinfee, false);
                calDeductBalResult.status = (thirdWalletChk.code === 200) ? true : false;
                calDeductBalResult.remainingBal = thirdWalletChk.data.current_deposit;
                calDeductBalResult.remainingBns = thirdWalletChk.data.current_bonus;
                calDeductBalResult.remainingWin = thirdWalletChk.data.current_win;
                calDeductBalResult.deductBal = thirdWalletChk.data.deduct_deposit;
                calDeductBalResult.deductBns = thirdWalletChk.data.deduct_bonus;
                calDeductBalResult.deductWin = thirdWalletChk.data.deduct_win;
            } else {
                calDeductBalResult = await calDeductBal(pool_list.joinfee, gameSettingsDetail.value, userDetail["walletbalance"], userDetail["wltbns"], userDetail["wltwin"], params.userid, false, req,vendorDbConnection);
            }


            let sumTotalJoinFeeDepots = userDetail["totaljoinfeedepots"] + calDeductBalResult.deductBal;
            let sumTotalJoinFeeWin = userDetail["totaljoinfeewin"] + calDeductBalResult.deductWin;

            if (calDeductBalResult.status == true) {
                let currentCnt = (pool_list.joineduser) ? pool_list.joineduser + 1 : 1;
                await PoolSchema.updateOne({ _id: params.poolid }, { "$set": { joineduser: currentCnt } })
                let resJoinSCont = await JoinContestsSchema.create(params)

                if (resJoinSCont._id) {
                    let jpoolID = resJoinSCont._id.toString();
                    let sumTotalJoinFee = userDetail["totaljoinfee"] + pool_list.joinfee;

                    let user = await UsersSchema.update({"_id":ObjectId(params.userid)},
                        {"$set":{
                            "walletbalance": calDeductBalResult.remainingBal, "wltbns": calDeductBalResult.remainingBns,
                            "wltwin": calDeductBalResult.remainingWin, "totaljoinfee": sumTotalJoinFee, "totaljoinfeedepots": sumTotalJoinFeeDepots, "totaljoinfeewin": sumTotalJoinFeeWin
                        }});

                    //[plyacc, mplycont, buysell, splycont, tmacc, pzpool, tmcont, optn, longtrm, ipo]
                    let currentDate = currentTimeZoneDate() * 1 / 1000;
                    let objTransBal = { "userid": params.userid, "amount": calDeductBalResult.deductBal, "txdate": currentDate, "ttype": "dr", "gtype": gtype, "atype": "join_bal", "jpoolid": jpoolID };
                    await TransactionsSchema.create(objTransBal);
                    let objTransBns = { "userid": params.userid, "amount": calDeductBalResult.deductBns, "txdate": currentDate, "ttype": "dr", "gtype": gtype, "atype": "join_bns", "jpoolid": jpoolID, "bnstring": calDeductBalResult.bnsTransString };
                    await TransactionsSchema.create(objTransBns);
                    let objTransWin = { "userid": params.userid, "amount": calDeductBalResult.deductWin, "txdate": currentDate, "ttype": "dr", "gtype": gtype, "atype": "join_win", "jpoolid": jpoolID };
                    await TransactionsSchema.create(objTransWin);
                    return res.send(response({}, "pool joined successfully.", true))
                } else {
                    return res.send(response({}, "Something went wrong.", false))
                }
            } else {
                return res.send(response({}, "You don't have enough balance, please add an amount.", false))
            }

            ///////////////////




        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    prize_join_preview_series: async (req, res, next) => {
        try {
            console.log("---prize_join_preview_series-->>")
            const generalDbConnection = await connectWithGeneralDb();
            const GameSettingsSchema = createGameSettingsModel(generalDbConnection);
            
            const cktDbConnection = await connectWithCricketDb();
            const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);

            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const PoolSchema = createPoolModel(vendorDbConnection);
            const UsersSchema = createUsersModel(vendorDbConnection);
            
            const params = req.body;
            console.log("params44--->>", params)
            if (params?.match_id) {
                let matchDetail = await UpcomingCricketsSchema.findOne({ "match_id": params.match_id });

                let currentDates = currentTimeZoneDate() * 1 / 1000;
                let matchDate = matchDetail?.date_start_ist * 1 / 1000;
                if (matchDate < currentDates) {
                    return res.send(response({}, "Match is live now. You cannot join", false))
                }
            }


            let wherepool = {
                "_id": ObjectId(params.pool_id)
            }
            let findData = await PoolSchema.findOne(wherepool, { joinfee: 1, "usable_bonus_percentage": 1 })
            // const prize_preview = await UsersSchema.findOne({
            //     where: {
            //         id: params.user_id
            //     },
            //     attributes: ['walletbalance', 'wltbns'],
            // });
            // transaction_detail = transDes;
            // let transData = { transaction_detail, prize_preview }
            /////////////////////
            //let gameSettingsDetail = await GameSettingsSchema.findOne({ "key": "bnsused" }) // Todo: Not using
            const userDetail = await UsersSchema.findOne({ _id: ObjectId(params.user_id) }, 
                {'walletbalance':1, 'wltbns':1, 'wltwin':1, 'phone':1});

            // let bnsFromFee = (userDetail["wltbns"] > 0) ? (findData.joinfee * (gameSettingsDetail.value) / 100) : 0;
            // let addWltbns = ((userDetail["wltbns"]) > 0) ? (userDetail["wltbns"] - (bnsFromFee)) : 0;
            // addWltbns = (addWltbns < 0) ? userDetail["wltbns"] : addWltbns;
            // let addWalBal = (userDetail["walletbalance"] > 0) ? (findData.joinfee - bnsFromFee) : 0;
            // let totalBalBns = (userDetail["walletbalance"] + bnsFromFee) - (findData.joinfee);
            // let currentWalletbalance = userDetail["walletbalance"] - addWalBal;
            // let currentBnsbalance = userDetail["wltbns"] - bnsFromFee;


            /////////////////////
            if (!userDetail) {
                return res.send(response({}, `Account doesn't exsist.`, false))
            }
            if (!findData) {
                return res.send(response({}, `pool_id doesn't exsist.`, false))
            }

            let calDeductBalResult = {};
            if (req.user.userType==2) {
                let thirdWalletChk = await thirdWalletChkApi(req.user.apikey, userDetail["phone"], findData.joinfee, true);
                calDeductBalResult.status = (thirdWalletChk.code === 200) ? true : false;
                calDeductBalResult.remainingBal = thirdWalletChk.data.current_deposit;
                calDeductBalResult.remainingBns = thirdWalletChk.data.current_bonus;
                calDeductBalResult.remainingWin = thirdWalletChk.data.current_win;
                calDeductBalResult.deductBal = thirdWalletChk.data.deduct_deposit;
                calDeductBalResult.deductBns = thirdWalletChk.data.deduct_bonus;
                calDeductBalResult.deductWin = thirdWalletChk.data.deduct_win;
            } else {
                calDeductBalResult = await calDeductBal(findData.joinfee, findData.usable_bonus_percentage, userDetail["walletbalance"], userDetail["wltbns"], userDetail["wltwin"], params.user_id, true, req,vendorDbConnection);
            }



            let sendResponse = {};
            if (calDeductBalResult.status == true) {
                ////////////////////
                sendResponse = {
                    joinfee: findData.joinfee,
                    walletbonous: calDeductBalResult.deductBns,
                    walletbalance: calDeductBalResult.deductBal,
                    walletwin: calDeductBalResult.deductWin,
                    bnsperc: findData.usable_bonus_percentage,
                    is_bal: calDeductBalResult.status
                }
                console.log("sendResponse--1->>", sendResponse)
            } else {
                sendResponse = {
                    joinfee: findData.joinfee,
                    walletbonous: calDeductBalResult.deductBns,
                    walletbalance: calDeductBalResult.deductBal,
                    walletwin: calDeductBalResult.deductWin,
                    bnsperc: findData.usable_bonus_percentage,
                    is_bal: calDeductBalResult.status

                }
                console.log("sendResponse--2->>", sendResponse)
            }
            //prize_preview.joinfee = findData[0].joinfee
            return res.send(response(sendResponse, `prize join preview succesfully`, true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    match_contest: async (req, res, next) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const JoinMatchContestsSchema = createJoinMatchContestsModel(vendorDbConnection);

            const params = req.body;
            params.userid = req.user.id;
            let sendResponse = {};
            let limit = (req.query.page) ? parseInt(req.query.limit) : 4;
            let page = (req.query.page) ? parseInt(req.query.page) : 0;

            let user_contest_list = await JoinMatchContestsSchema.find({ match_id: params.match_id, userid: params.userid }).lean();

            sendResponse.user_contest_list = user_contest_list;

            return res.send(response(sendResponse, "Data found succesfully.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    user_team_player_list: async (req, res, next) => {
        const params = req.body;
        const cktDbConnection = await connectWithCricketDb();
        const CktPlayerMetaDataSchema = createCktPlayerMetaDataModel(cktDbConnection);
        const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);
        const CktPlayersSchema = createCktPlayersModel(cktDbConnection);

        const footballDbConnection = await connectWithFootballDb();
        const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);
        const FbPlayerDetailsSchema = createFbPlayerDetailsModel(footballDbConnection);
        const FbSeriesMetaDatasSchema = createFbSeriesMetaDatasModel(footballDbConnection);
        const FbLeaguesSchema = createFbLeaguesModel(footballDbConnection);

        const dbName = req.user.dbName;
        const vendorDbConnection = await connectWithVendorDb(dbName);
        const UserPlayerMatchCktsSchema = createUserPlayerMatchCktsModel(vendorDbConnection);
        const UserPlayerMatchFbsSchema = createUserPlayerMatchFbsModel(vendorDbConnection);
        const UserPlayersCktSchema = createUserPlayersCktModel(vendorDbConnection);
        const UserPlayersFbSchema = createUserPlayersFbModel(vendorDbConnection);

        params.match_id=parseInt(params.match_id);
        console.log("params-->>",params);

        if (params.type === "s") {
            try {
                const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);
                const CktSeriesMetaDataSchema = createCktSeriesMetaDataModel(cktDbConnection);
                const ContestSeriesSchema = createContestSeriesModel(vendorDbConnection);

                params.league_id = parseInt(params.match_id);
                let userPlymSchema = null;
                let playersdetail = "";
                let plymetadatas = "";
                let plyrfantpoints = "";
                let upcomingMatchSchema = null;

                if (params.gametype == "ckt") {
                    userPlymSchema = (params.type === "s") ? UserPlayersCktSchema : UserPlayerMatchCktsSchema;
                    playersdetail = CktPlayersSchema;
                    plymetadatas = "cktplymetadatas";
                    plyrfantpoints = "plyrfantpoints";
                    upcomingMatchSchema = UpcomingCricketsSchema;
                } else if (params.gametype == "fb") {
                    userPlymSchema = (params.type === "s") ? UserPlayersFbSchema : UserPlayerMatchFbsSchema;
                    playersdetail = FbPlayerDetailsSchema;
                    plymetadatas = "fbplymetadatas";
                    plyrfantpoints = "fbplyrfantpoints";
                    upcomingMatchSchema = FbUpcomingsSchema;
                }

                let m_s_id = (params.type === "s") ? "league_id" : "match_id";

                let grp_data = {
                    _id: { "pid": "$pid" }, "league_id": { $first: "$league_id" }, "uteamid": { $first: "$uteamid" }
                    , "userid": { $first: "$userid" }, "pid": { $first: "$pid" }, "playing_role": { $first: "$playing_role" }
                    , "mteam_id": { $first: "$mteam_id" }, "team_count": { $first: "$team_count" }, "team_no": { $first: "$team_no" }
                    , "player_meta": { $first: "$player_meta" }, "plyrfant_points": { $first: "$plyrfant_points" },
                    tp: { "$sum": "$plyrfant_points.tp" }, "allmatch_id": { $first: "$allmatch_id" }, "match_ids": { $first: "$match_ids" }
                }

                if (params.type === "s") {
                    grp_data["is_substitue"] = { $first: "$is_substitue" };
                    grp_data["match_ids"] = { $first: "$match_ids" };
                }

                //////////////

                let chkContSer = await ContestSeriesSchema.findOne({ "league_id": params.league_id, "contest_id": ObjectID(params.contest_id) });
                let sDate = chkContSer?.date_start;
                let eDate = chkContSer?.date_end;
                console.log("sDate--->>", sDate, eDate);
                let upcomingList = await upcomingMatchSchema.find({ "cid": params.league_id, "date_start_ist": { "$gte": sDate, "$lte": eDate } }, { match_id: 1, short_title: 1, date_start_ist: 1 });
                let matchIds = [];
                let matchDetail = {};
                upcomingList.forEach(itemMid => {
                    matchIds.push(itemMid.match_id);
                    matchDetail[itemMid.match_id] = {
                        "name": itemMid.short_title,
                        "date": itemMid.date_start_ist
                    }
                })
                console.log("matchIds--->>", matchIds, matchDetail)

                //////////////

                let userplymcktList = await userPlymSchema.aggregate([
                    {
                        "$match": { uteamid: ObjectId(params.uteamid), [m_s_id]: params.match_id }
                    },

                    {
                        $lookup:
                        {
                            from: plymetadatas,
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
                            from: plyrfantpoints,
                            localField: "pid",
                            foreignField: "pid",
                            as: "plyrfant_points",
                            pipeline: [
                                {
                                    $match: {
                                        "match_id": { "$in": matchIds }
                                    }
                                }]
                        },

                    },
                    // {
                    //     $unwind: {
                    //         "path": "$plyrfant_points",
                    //         "preserveNullAndEmptyArrays": true
                    //     }
                    // },
                    {
                        $group: grp_data
                    }
                ])

                let dataList = {};

                if (userplymcktList && userplymcktList.length > 0) {
                    let leagueDetail = null, leagueMeta = null;
                    if (params.type === "s") {
                        if (params.gametype == "ckt") {
                            leagueDetail = await CktLeaguesSchema.findOne({ cid: params.match_id })
                            leagueMeta = await CktSeriesMetaDataSchema.findOne({ "league_id": params.match_id })
                        } else {
                            leagueDetail = await FbLeaguesSchema.findOne({ season_id: params.match_id })
                            leagueMeta = await FbSeriesMetaDatasSchema.findOne({ "league_id": params.match_id })
                        }

                    } else {
                        if (params.gametype == "ckt") {
                            let upcomingCricketDetail = await UpcomingCricketsSchema.findOne({ match_id: params.match_id }, { "teama": 1, "teamb": 1 })
                            dataList.teamDetail = upcomingCricketDetail

                        } else {
                            let upcomingFootballDetail = await FbUpcomingsSchema.findOne({ match_id: params.match_id }, { "teama": 1, "teamb": 1 })
                            dataList.teamDetail = upcomingFootballDetail
                        }
                    }

                    let ftp = 0;
                    let ftpMatch = {};
                    userplymcktList = await Promise.all(userplymcktList.map((item) => {
                        return new Promise(async (resolve, reject) => {

                            ////////////////////////////
                            let plyPoints = item["plyrfant_points"];
                            plyPoints && plyPoints.forEach((itemPlyPnt) => {
                                if (item["allmatch_id"] && itemPlyPnt && item["allmatch_id"].indexOf(itemPlyPnt["match_id"]) > -1) {
                                    if (item["match_ids"].indexOf(itemPlyPnt["match_id"]) > -1) {

                                        if (itemPlyPnt) {
                                            let mPoints = (ftpMatch && ftpMatch[itemPlyPnt["pid"]] && ftpMatch[itemPlyPnt["pid"]][itemPlyPnt["match_id"]]) ? ftpMatch[itemPlyPnt["pid"]][itemPlyPnt["match_id"]] : 0;
                                            let matchPtn = {};
                                            matchPtn[itemPlyPnt["match_id"]] = mPoints + itemPlyPnt["tp"];

                                            let plyData = matchPtn[itemPlyPnt["match_id"]];
                                            console.log("plyData-" + itemPlyPnt["match_id"] + "---" + itemPlyPnt["pid"] + "-->>", matchPtn)
                                            ftpMatch[itemPlyPnt["pid"]] = { ...matchPtn, ...ftpMatch[itemPlyPnt["pid"]] };
                                        }

                                        ftp = ftp + ((itemPlyPnt && itemPlyPnt["tp"]) ? itemPlyPnt["tp"] : 0);
                                        //console.log("sFant-no_substitue-",playersFantasy[i]["uteamid"],+itemPlyPnt["pid"]+",MatchId="+itemPlyPnt["match_id"]+"--j="+j+",m="+m+"-->>",tpNo,itemPlyPnt["tp"],item["match_ids"]);
                                    }

                                } else {
                                    //console.log("is_substitue==>>",item["is_substitue"])
                                    //console.log("sFant-yes_substitue-",item["is_substitue"],playersFantasy[i]["uteamid"],+itemPlyPnt["pid"]+",MatchId="+itemPlyPnt["match_id"]+"--j="+j+",m="+m+"-->>",tpNo,itemPlyPnt["tp"],item["match_ids"]);
                                    if (item["is_substitue"] == 0) {

                                        if (itemPlyPnt) {
                                            let mPoints = (ftpMatch && ftpMatch[itemPlyPnt["pid"]] && ftpMatch[itemPlyPnt["pid"]][itemPlyPnt["match_id"]]) ? ftpMatch[itemPlyPnt["pid"]][itemPlyPnt["match_id"]] : 0;
                                            let matchPtn = {};
                                            matchPtn[itemPlyPnt["match_id"]] = mPoints + itemPlyPnt["tp"];

                                            let plyData = matchPtn[itemPlyPnt["match_id"]];
                                            console.log("plyData-" + itemPlyPnt["match_id"] + "---" + itemPlyPnt["pid"] + "-->>", matchPtn)
                                            ftpMatch[itemPlyPnt["pid"]] = { ...matchPtn, ...ftpMatch[itemPlyPnt["pid"]] };
                                        }


                                        ftp = ftp + ((itemPlyPnt && itemPlyPnt["tp"]) ? itemPlyPnt["tp"] : 0);

                                    }
                                }
                            })

                            /////////////////////////////////

                            let player_data = await playersdetail.findOne({ [m_s_id]: (params.type === "s" ? params.match_id : item.match_id), pid: item.pid }).lean();

                            let plyrfant_points = (item && item.plyrfant_points && item.plyrfant_points.tp) ? item.plyrfant_points.tp : 0;

                            if (params.gametype == "ckt") {


                                let playerLogo = await CktPlayerMetaDataSchema.findOne({ pid: item.pid, });
                                //console.log("playerLogoplayerLogo",playerLogo,item.pid)
                                let logo_url = (item && item.player_meta && item.player_meta.logo_url) ? `${env.awsimgurl}profile_doc/${item.player_meta.logo_url}` : "";
                                if (playerLogo) {
                                    logo_url = `${env.awsimgurl}profile_doc/${playerLogo.logo_url}`;
                                    item.player_meta.logo_url = `${env.awsimgurl}profile_doc/${playerLogo.logo_url}`;
                                }
                                if (params.type === "s") {
                                    item.team_name = leagueDetail.name;
                                    item.logo_url = (leagueMeta.logo_url) ? `${env.awsimgurl}profile_doc/${leagueMeta?.logo_url}` : `${env.awsimgurl}profile_doc/${leagueDetail?.logo_url}`;
                                } else {
                                    if (dataList.teamDetail.teama.team_id == player_data?.tid) {
                                        item.team_name = dataList.teamDetail.teama.name;
                                        item.team_short_name = dataList.teamDetail.teama.short_name;
                                    } else if (dataList.teamDetail.teamb.team_id == player_data?.tid) {
                                        item.team_name = dataList.teamDetail.teamb.name;
                                        item.team_short_name = dataList.teamDetail.teamb.short_name;
                                    }
                                }

                                item.playing_role = player_data?.playing_role;
                                item.batting_style = player_data?.batting_style;
                                item.bowling_style = player_data?.bowling_style;

                                item.name = player_data?.short_name;
                                item.image_path = logo_url;
                                console.log("00--->>", ftpMatch[item.pid])
                                let tt = 0;

                                ftpMatch[item.pid] && Object.keys(ftpMatch[item.pid]).map(itmPnt => {
                                    tt = tt + ftpMatch[item.pid][itmPnt];
                                    console.log("00-1-->>", ftpMatch[item.pid])
                                })

                                item.tp = tt;


                            } else if (params.gametype == "fb") {
                                let logo_url = (item && item.player_meta && item.player_meta.logo_url) ? `${env.awsimgurl}profile_doc/${item.player_meta.logo_url}` : player_data.image_path;

                                if (params.type === "s") {
                                    item.team_name = "";
                                    item.team_short_name = "";
                                } else {
                                    if (dataList.teamDetail.teama.team_id == player_data.tid) {
                                        item.team_name = dataList.teamDetail.teama.name;
                                        item.team_short_name = dataList.teamDetail.teama.short_name;
                                    } else if (dataList.teamDetail.teamb.team_id == player_data.tid) {
                                        item.team_name = dataList.teamDetail.teamb.name;
                                        item.team_short_name = dataList.teamDetail.teamb.short_name;
                                    }
                                }


                                item.position_id = player_data.position_id;
                                item.name = player_data.fullname;
                                item.image_path = logo_url;

                                item.tp = function () {
                                    let tt = 0;
                                    ftpMatch[item.pid] && Object.keys(ftpMatch[item.pid]).map(itmPnt => {
                                        tt = tt + ftpMatch[item.pid][itmPnt];

                                    })
                                    return tt;
                                }
                            }
                            item.points = ftpMatch[item.pid];
                            delete item.plyrfant_points;
                            resolve(item)
                        })
                    }))
                    //    console.log("const_status-->>",const_status);
                    //     userplymcktList.const_status=const_status;
                    //console.log("ftp--->>",ftp,ftpMatch, JSON.stringify(userplymcktList))
                    let data = {
                        "player_list": userplymcktList, match_name: matchDetail
                    };
                    return res.send(response(data, "Data fetch successfully.", true))
                } else {
                    return res.send(response({}, "Not found", false))
                }

            } catch (error) {
                return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
            }
        } else {
            try {

                let userPlymSchema = null;
                let cktPlayerData = "";
                let plymetadatas = "";
                let plyrfantpoints = "";
                let playersdetail="";
                if (params.gametype == "ckt") {
                    userPlymSchema = UserPlayerMatchCktsSchema;
                    cktPlayerData = CktPlayersSchema;
                    plymetadatas = "ckt_player_meta_data";
                    plyrfantpoints = "ckt_players_fantasy_points";
                    playersdetail="ckt_player_details";
                } else if (params.gametype == "fb") {
                    userPlymSchema = UserPlayerMatchFbsSchema;
                    cktPlayerData = FbPlayerDetailsSchema;
                    plymetadatas = "fb_players_meta_data";
                    plyrfantpoints = "fb_player_fantasy_points";
                    playersdetail="fb_player_details";
                }

                let userplymcktPidList = await userPlymSchema.distinct("pid",
                    { uteamid: ObjectId(params.uteamid), match_id: params.match_id })
                    console.log("userplymcktList-->>",userplymcktPidList);

                let userplymcktList = await cktPlayerData.aggregate([
                    {
                        "$match": {match_id: params.match_id,"pid":{"$in":userplymcktPidList}}
                    },
                    {
                        $lookup:
                        {
                            from: playersdetail,
                            localField: "pid",
                            foreignField: "pid",
                            as: "player_detail"
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
                            from: plymetadatas,
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
                            from: plyrfantpoints,
                            localField: "pid",
                            foreignField: "pid",
                            as: "plyrfant_points",
                            pipeline: [
                                {
                                    $match: {
                                        match_id: params.match_id
                                    }
                                }]
                        },

                    },
                    {
                        $unwind: {
                            "path": "$plyrfant_points",
                            "preserveNullAndEmptyArrays": true
                        }
                    },
                ])

                let dataList = {};

                if (userplymcktList && userplymcktList.length > 0) {

                    if (params.gametype == "ckt") {
                        let upcomingCricketDetail = await UpcomingCricketsSchema.findOne({ match_id: params.match_id }, { "teama": 1, "teamb": 1 })
                        dataList.teamDetail = upcomingCricketDetail

                    } else {
                        let upcomingFootballDetail = await FbUpcomingsSchema.findOne({ match_id: params.match_id }, { "teama": 1, "teamb": 1 })
                        dataList.teamDetail = upcomingFootballDetail
                    }

                    userplymcktList = await Promise.all(userplymcktList.map((item) => {
                        return new Promise(async (resolve, reject) => {

                            //let player_data = await playersdetail.findOne({ match_id: item.match_id, pid: item.pid }).lean();

                            let plyrfant_points = (item && item.plyrfant_points && item.plyrfant_points.tp) ? item.plyrfant_points.tp : 0;

                            //if (params.gametype == "ckt") {


                                //let playerLogo = await CktPlayerMetaDataSchema.findOne({ pid: item.pid, });
                                //console.log("playerLogoplayerLogo",playerLogo,item.pid)
                                let logo_url = (item && item.player_meta && item.player_meta.logo_url) ? `${env.awsimgurl}profile_doc/${item.player_meta.logo_url}` : "";
                                // if (item.player_meta.logo_url) {
                                //     logo_url = `${env.awsimgurl}profile_doc/${playerLogo.logo_url}`;
                                //     item.player_meta.logo_url = `${env.awsimgurl}profile_doc/${playerLogo.logo_url}`;
                                // }
                                if (dataList.teamDetail.teama.team_id == item.tid) {
                                    item.team_name = dataList.teamDetail.teama.name;
                                    item.team_short_name = dataList.teamDetail.teama.short_name;
                                } else if (dataList.teamDetail.teamb.team_id == item.tid) {
                                    item.team_name = dataList.teamDetail.teamb.name;
                                    item.team_short_name = dataList.teamDetail.teamb.short_name;
                                }

                                item.playing_role = item?.player_detail?.playing_role;
                                item.batting_style = item?.player_detail?.batting_style;
                                item.bowling_style = item?.player_detail?.bowling_style;

                                item.name = item?.player_detail?.short_name;
                                item.image_path = logo_url;
                                item.tp = plyrfant_points;


                            // } else if (params.gametype == "fb") {
                            //     let logo_url = (item && item.player_meta && item.player_meta.logo_url) ? `${env.awsimgurl}profile_doc/${item.player_meta.logo_url}` : player_data.image_path;


                            //     if (dataList.teamDetail.teama.team_id == player_data.tid) {
                            //         item.team_name = dataList.teamDetail.teama.name;
                            //         item.team_short_name = dataList.teamDetail.teama.short_name;
                            //     } else if (dataList.teamDetail.teamb.team_id == player_data.tid) {
                            //         item.team_name = dataList.teamDetail.teamb.name;
                            //         item.team_short_name = dataList.teamDetail.teamb.short_name;
                            //     }

                            //     item.position_id = player_data.position_id;
                            //     item.name = player_data.fullname;
                            //     item.image_path = logo_url;
                            //     item.tp = plyrfant_points
                            // }
                            delete item.plyrfant_points;
                            resolve(item)
                        })
                    }))
                    //dataList.userplyList=userplymcktList;





                    // let playerList = [];
                    // userplymcktList && userplymcktList.forEach((item) => {
                    //     let plyrfant_points = (item && item.plyrfant_points && item.plyrfant_points.tp) ? item.plyrfant_points.tp : 0;
                    //     let logo_url = (item && item.player_meta && item.player_meta.logo_url) ? `${env.awsimgurl}profile_doc/${item.player_meta.logo_url}` : "";
                    //     let objData = {
                    //         "pid": item.pid, "playing_role": item.playing_role, "name": item.player_detail.short_name, "tp": plyrfant_points
                    //         , logo_url: logo_url, "batting_style": item.player_detail.batting_style, "bowling_style": item.player_detail.bowling_style
                    //     }
                    //     playerList.push(objData);
                    // });
                    let data = {
                        "player_list": userplymcktList
                    };
                    return res.send(response(data, "Data fetch successfully.", true))
                } else {
                    return res.send(response({}, "Not found", false))
                }


            } catch (error) {
                console.log("error-->>",error)
                return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
            }

        }
    },

}





let matchCricketContestList = async (req, res, next, playersSchema, userTeamSchema, joinContSchema, gametype, type, upcomingdatestart) => {
    try {
        const cktDbConnection = await connectWithCricketDb();
        const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);
        const CktSeriesMetaDataSchema = createCktSeriesMetaDataModel(cktDbConnection);

        const footballDbConnection = await connectWithFootballDb();
        const FbLeaguesSchema = createFbLeaguesModel(footballDbConnection);
        const FbLeaguesSeasonsSchema=createFbLeaguesSeasonsModel(footballDbConnection);

        const dbName = req.user.dbName;
        const vendorDbConnection = await connectWithVendorDb(dbName);
        const ContestsSchema = createContestsModel(vendorDbConnection);

        const params = req.body;
        params.userid = req.user.id;
        let limit = (req.query.page) ? parseInt(req.query.limit) : 4;
        let page = (req.query.page) ? parseInt(req.query.page) : 0;
        //let skip = limit;
        
        let m_s_id = "";
        if (type == "m") {
            m_s_id = "match_id";
        } else if (type == "s") {
            m_s_id = "league_id";
        }
        let where = {
            [m_s_id]: parseInt(params[m_s_id])
        }

        // console.log("where--->>",where)

        let myUsrTeam = await userTeamSchema.countDocuments({
            [m_s_id]: parseInt(params[m_s_id]),
            userid: params.userid
        })


        let joinContestCount = await joinContSchema.countDocuments({
            [m_s_id]: parseInt(params[m_s_id]),
            userid: params.userid, "gametype": gametype
        })
        letSendTeamData = {}
        var date_start = {};


        if (type == "m") {
            // if (gametype == "ckt") {
            let findData = await playersSchema.find(where, { teama: 1, teamb: 1 }).lean()
            date_start = await upcomingdatestart.findOne(where, { date_start_ist: 1 }).lean()




            // let newValueData = findData.map(async (item) => {
            //     letSendTeamData = {
            //         teama_id: item?.teama?.team_id,
            //         teamb_id: item?.teamb?.team_id,
            //         teama: item.teama.team.title,
            //         teamalogo: item.teama.team.logo_url,
            //         teamb: item.teamb.team.title,
            //         teamblogo: item.teamb.team.logo_url,
            //         date_start: date_start.date_start_ist
            //     }
            // })

            findData.map(async (item) => {
                letSendTeamData = {
                    teama_id: item?.teama?.team_id,
                    teamb_id: item?.teamb?.team_id,
                    teama: item.teama.team.title,
                    teamalogo: item.teama.team.logo_url,
                    teamb: item.teamb.team.title,
                    teamblogo: item.teamb.team.logo_url,
                    date_start: date_start.date_start_ist
                }
            })



            if (letSendTeamData) {
                const cktDbConnection = await connectWithCricketDb();
                const CktTeamMetaDataSchema = createCktTeamMetaDataModel(cktDbConnection);

                let teammetadata = await CktTeamMetaDataSchema.find({ "team_id": { "$in": [letSendTeamData.teama_id, letSendTeamData.teamb_id] } });

                // teammetadata?.map((item,index) => { 
                //     TeamList.push({
                //           teamLogo: `${env.awsimgurl}profile_doc/${item.logo_url}`,     
                //     }) 
                // })
                let teamLogo = {};
                let TeamList = teammetadata?.map(item => {

                    teamLogo[item.team_id] = `${env.awsimgurl}profile_doc/${item.logo_url}`

                }
                )

                if (teamLogo.length > 0) {
                    letSendTeamData.teamalogo = (teamLogo[letSendTeamData.teama_id]) ? teamLogo[letSendTeamData.teama_id]?.teamLogo : "";
                    letSendTeamData.teamblogo = (teamLogo[letSendTeamData.teamb_id]) ? teamLogo[letSendTeamData.teamb_id]?.teamLogo : "";
                }

            }

            // }
        } else if (type == "s") {
            let findData = {}
            if (gametype == "ckt") {
                console.log("where.league_id--->",where?.league_id)
                let send_array = { cid: where.league_id }
                findData = await CktLeaguesSchema.findOne(send_array)


                let checkhttpurl = (findData?.logo_url) ? isValidHttpUrl(findData.logo_url) : null;
                if (checkhttpurl) {
                    findData.logo_url = findData.logo_url
                } else {
                    findData.logo_url = `${env.awsimgurl}profile_doc/${findData?.logo_url}`
                }
                // return (findData)
                let league_array = { league_id: where.league_id }
                let itemLogo = await CktSeriesMetaDataSchema.findOne(league_array);

                letSendTeamData = {
                    title: findData.name,
                    logo_url: (itemLogo && itemLogo.logo_url) ? `${env.awsimgurl}profile_doc/${itemLogo.logo_url}` : findData.logo_url,
                    date_start: findData.date_start
                }

            } else if (gametype == "fb") {
                let send_array = { season_id: where.league_id }
                findData = await FbLeaguesSeasonsSchema.aggregate([{"$match":send_array},
                    {
                        $lookup:
                        {
                            from: "fb_league_details",
                            localField: "league_id",
                            foreignField: "id",
                            as: "league_details"
                        },
    
                    },
                    {
                            $unwind: { path: "$league_details", preserveNullAndEmptyArrays: true },
                    },
                ])

                findData=findData?.[0];
                
                
                let checkhttpurl = (findData?.league_details?.logo_url) ? isValidHttpUrl(findData?.league_details?.logo_url) : null;
                if (checkhttpurl) {
                    findData.logo_url = findData?.league_details?.logo_url
                } else {
                    findData.logo_url = `${env.awsimgurl}profile_doc/${findData?.league_details?.logo_url}`
                }
                //letSendTeamData : {};
                if (findData) {
                    letSendTeamData = {
                        title: findData?.league_details?.name,
                        logo_url: findData?.league_details?.logo_path,
                        date_start: findData?.league_details?.date_start
                    }
                    console.log("letSendTeamData--->>",JSON.stringify(letSendTeamData));
                }

            }

        }
        let sendResponse = {};

        let filterData = {};
        let poolprizebreakData = {};

        filterData[m_s_id] = parseInt(params[m_s_id]);
        //fitler for number of teams
        if (req.body.uptojoinmin && req.body.uptojoinmax) {
            filterData["uptojoin"] = { "$gte": req.body.uptojoinmin, "$lte": req.body.uptojoinmax };
        }

        //filter of entry
        if (params.emtrymin && params.entrymax) {
            filterData["joinfee"] = { "$gte": params.emtrymin, "$lte": params.entrymax };
        }


        //filter for contest type
        if (params.gurantee && (params.gurantee == 1)) {

            filterData["c"] = 1;
        }
        //m &s
        if (params.contestType) {
            filterData[params.contestType] = 1;
        }
        //filter for prize pool
        // if (params.prizepoolmin && params.prizepoolmax) {
        //     poolprizebreakData["pamount"] = { "$gte": req.body.prizepoolmin, "$lte": req.body.prizepoolmax };
        // }

        filterData["isChecked"] = 1;
        filterData["status"] = 1;
        filterData["ispoolfull"] = { "$ne": 1 };
        if (params?.isprivate == 1) {
            filterData["$or"] = [{ isprivate: 1 }]
        } else {
            filterData["$or"] = [{ isprivate: 0 }, { isprivate: 1, createdby: params.userid }]
        }

        if (params.contestid && params.contestid != '') {
            filterData["_id"] = ObjectId(params.contestid);
            // $match: { "_id": ObjectId(params.pool_id) }
        }
        
        let currentDates = currentTimeZoneDate();
        console.log("filterDataparamsDD",where.league_id,currentDates, filterData, params);
        let queryCont = null;
        if (type === "m") {
            queryCont = [
                {
                    $sort: { order: 1 }
                },
                {
                    $lookup:
                    {
                        from: "pools",
                        localField: "_id",
                        foreignField: "contest_id",
                        as: "poollist",
                        pipeline: [
                            {
                                $match: filterData
                            },
                            {
                                $sort: { "order_by": 1 }
                            },
                            {
                                $lookup:
                                {
                                    from: "pool_prize_breaks",
                                    localField: "_id",
                                    foreignField: "pool_id",
                                    as: "poolpb"
                                },

                            },
                            // {
                            //     $lookup:
                            //     {
                            //         from: "contest_series",
                            //         localField: "contest_id",
                            //         foreignField: "contest_id",
                            //         as: "contestseries",
                            //         pipeline: [
                            //             {
                            //                 $match: { "league_id": where.league_id, }
                            //             },

                            //         ]
                            //     }

                            // },
                            // {
                            //     $unwind: {
                            //         "path": "$contestseries",
                            //         "preserveNullAndEmptyArrays": true
                            //     }
                            // },

                        ]
                    },

                },


                {
                    $project: {
                        moreThanFive: { $gt: [{ $size: "$poollist" }, 0] },
                        dis_val: 1, status: 1, title: 1, subtitle: 1, favcontest: 1,
                        isprivate: 1, teama: 1, "poollist.uptojoin": 1,
                        "poollist.joineduser": 1, "poollist.joinfee": 1,
                        "poollist.totalwinamt": 1, "poollist.winners": 1,
                        "poollist.maxteams": 1, ["poollist." + m_s_id]: 1,
                        "poollist._id": 1, "poollist.status": 1, "poollist.type": 1,
                        "poollist.ispoolfull": 1, "poollist.iscancel": 1, "poollist.gtype": 1,
                        "poollist.isprivate": 1, "poollist.privatename": 1, "poollist.c": 1, "poollist.m": 1,
                        "poollist.s": 1, "poollist.poolpb.pmin": 1, "poollist.poolpb.pmax": 1,
                        "poollist.poolpb.pamount": 1, "poollist.poolpb._id": 1
                        , "poollist.usable_bonus_percentage": 1//, "poollist.contestseries": 1
                    }
                },
                { $match: { moreThanFive: true } },

                {
                    $facet: {
                        data: [{ $skip: page }],
                        total_count: [
                            {
                                $count: 'count'
                            }
                        ]
                    }
                },
            ]
        } else {
            queryCont = [
                {
                    $lookup:
                    {
                        from: "contest_series",
                        localField: "_id",
                        foreignField: "contest_id",
                        as: "contestseries",
                        pipeline: [
                            {
                                $match: { "league_id": where.league_id, "date_start": { "$gte": currentDates } }
                            }]
                    }

                },
                {
                    $unwind: "$contestseries"
                },
                
                {
                    $sort: { order: 1 }
                },
                {
                    $lookup:
                    {
                        from: "pools",
                        localField: "_id",
                        foreignField: "contest_id",
                        as: "poollist",
                        pipeline: [
                            {
                                $match:filterData
                            },
                            {
                                $sort: { "order_by": 1 }
                            },
                            {
                                $lookup:
                                {
                                    from: "pool_prize_breaks",
                                    localField: "_id",
                                    foreignField: "pool_id",
                                    as: "poolpb"
                                },

                             },


                        ]
                    },

                },
                // {
                //     $unwind: {
                //         "path": "$poollist",
                //         "preserveNullAndEmptyArrays": true
                //     }
                // },

                {
                    $project: {
                        moreThanFive: { $gt: [{ $size: "$poollist" }, 0] },
                        dis_val: 1, status: 1, title: 1, subtitle: 1, favcontest: 1,
                        isprivate: 1, teama: 1, "poollist.uptojoin": 1,
                        "poollist.joineduser": 1, "poollist.joinfee": 1,
                        "poollist.totalwinamt": 1, "poollist.winners": 1,
                        "poollist.maxteams": 1, ["poollist." + m_s_id]: 1,
                        "poollist._id": 1, "poollist.status": 1, "poollist.type": 1,
                        "poollist.ispoolfull": 1, "poollist.iscancel": 1, "poollist.gtype": 1,
                        "poollist.isprivate": 1, "poollist.privatename": 1, "poollist.c": 1, "poollist.m": 1,
                        "poollist.s": 1, "poollist.poolpb.pmin": 1, "poollist.poolpb.pmax": 1,
                        "poollist.poolpb.pamount": 1, "poollist.poolpb._id": 1
                        , "poollist.usable_bonus_percentage": 1, "date_start": "$contestseries.date_start", "date_end": "$contestseries.date_end"
                    }
                },
                { $match: { moreThanFive: true } },

                {
                    $facet: {
                        data: [{ $skip: page }],
                        total_count: [
                            {
                                $count: 'count'
                            }
                        ]
                    }
                },
                
                
            ]
        }
        
       let result= await ContestsSchema.aggregate(queryCont);
            let dataContest = [];
            result[0]["data"].forEach((item) => {
                if (item.poollist.length > 0) {
                    dataContest.push(item);
                }
            })


            letSendTeamData["date_start"] = dateTimeZone(letSendTeamData["date_start"], req.user.timezone)//timeChange(req.user.id,letSendTeamData["date_start"]);
             
            sendResponse = {
                contestData: "",
                matchDetail: letSendTeamData,
                totalCount: (result?.[0]?.["total_count"]?.[0]?.["count"]) ? result?.[0]?.["total_count"]?.[0]?.["count"] : 0,
                contestCount: joinContestCount,
                mypicks: myUsrTeam,
                userid: params.userid

            }
            sendResponse.contestData = { "data": dataContest } //result[0]["data"] };


        

        return res.send(response(sendResponse, "Data found succesfully.!!!", true))

    } catch (error) {
        //console.log("errorerrorerrorerror",error);
        return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
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

let giveRank = async (arrayArg, resultArg, amtRankPerUser) => {

    // declaring and initilising variables
    let rank = 1;
    prev_rank = rank;
    position = 0;
    // displaying the headers in the console


    // looping through the rank array
    for (i = 0; i < arrayArg.length; i++) {

        /*
        If it is the first index, then automatically the position becomes 1.
        */
        if (i == 0) {

            position = rank;
            resultArg[i]["totalpnt"] = arrayArg[i];
            resultArg[i]["position"] = position;
            resultArg[i]["sno"] = i + 1;

            let filterAmt = amtRankPerUser.filter(x => x.pmin <= resultArg[i]["sno"] && x.pmax >= resultArg[i]["sno"])
            let perUsr = (filterAmt && filterAmt.length) ? filterAmt[0]["peramt"] : 0;
            resultArg[i]["peramt"] = perUsr;


            /*
            if the value contained in `[i]` is not equal to `[i-1]`, increment the `rank` value and assign it to `position`.
            The `prev_rank` is assigned the `rank` value.
            */
        } else if (arrayArg[i] != arrayArg[i - 1]) {
            rank++;
            position = rank;
            prev_rank = rank;
            resultArg[i]["totalpnt"] = arrayArg[i];
            resultArg[i]["position"] = position;
            resultArg[i]["sno"] = i + 1;
            let filterAmt = amtRankPerUser.filter(x => x.pmin <= resultArg[i]["sno"] && x.pmax >= resultArg[i]["sno"])
            let perUsr = (filterAmt && filterAmt.length) ? filterAmt[0]["peramt"] : 0;
            resultArg[i]["peramt"] = perUsr;


            /*
            Otherwise, if the value contained in `[i]` is equal to `[i-1]`,
            assign the position the value stored in the `prev_rank` variable then increment the value stored in the `rank` variable.*/
        } else {
            position = prev_rank;
            rank++;
            resultArg[i]["totalpnt"] = arrayArg[i];
            resultArg[i]["position"] = position;
            resultArg[i]["sno"] = i + 1;
            let filterAmt = amtRankPerUser.filter(x => x.pmin <= resultArg[i]["sno"] && x.pmax >= resultArg[i]["sno"])
            let perUsr = (filterAmt && filterAmt.length) ? filterAmt[0]["peramt"] : 0;
            resultArg[i]["peramt"] = perUsr;

        }
    }


    return await resultArg;

}

