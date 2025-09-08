require('dotenv').config();
const { winPerc, dateTimeZone, keyGen } = require('../../helper/common');

const response = require("../../helper/response");
const { connectWithGeneralDb, connectWithCricketDb, connectWithFootballDb, connectWithVendorDb } = require('../../config/mongodb_connections');
const createGameAccsModel = require('../../mongo_models_new/credexon_general/GameAccsSchema');
const createCktTeamMetaDataModel = require('../../mongo_models_new/credexon_cricket/CktTeamMetaDataSchema');
const createCktTeamFantasyPointsModel = require('../../mongo_models_new/credexon_cricket/CktTeamFantasyPointsSchema');
const createCktLeaguesModel = require('../../mongo_models_new/credexon_cricket/CktLeaguesSchema');
const createUpcomingCricketModel = require('../../mongo_models_new/credexon_cricket/UpcomingCricketsSchema');
const createCricketPlayersModel = require('../../mongo_models_new/credexon_cricket/CktPlayerDetailsSchema');
const createFbUpcomingsModel = require('../../mongo_models_new/credexon_football/FbUpcomingsSchema');
const createFbPlayersModel = require('../../mongo_models_new/credexon_football/FbPlayersSchema');
const createFbTeamFantasyPointsModel = require('../../mongo_models_new/credexon_football/FbTeamFantasyPointsSchema');
const createFbLeaguesModel = require('../../mongo_models_new/credexon_football/FbLeaguesSchema');
const createContestsModel = require('../../mongo_models_new/credexon_vendor/ContestsSchema');
const createJoinMatchContestsModel = require('../../mongo_models_new/credexon_vendor/JoinMatchContestsSchema');
const createJoinAccTeamsModel = require('../../mongo_models_new/credexon_vendor/JoinAccTeamsSchema');
const createUserTeamFbModel = require('../../mongo_models_new/credexon_vendor/UserTeamFbSchema');
const createUserTeamCktModel = require('../../mongo_models_new/credexon_vendor/UserTeamCktSchema');
const createUserCktLeagueModel = require('../../mongo_models_new/credexon_vendor/UserCktSeriesTeamSchema');
const createUserFbLeagueModel = require('../../mongo_models_new/credexon_vendor/UserFbSeriesTeamSchema');
const createSeriesJoinContestsModel = require("../../mongo_models_new/credexon_vendor/JoinSeriesContestsSchema");
const createFbTeamMetaDatasModel = require('../../mongo_models_new/credexon_football/FbTeamMetaDatasSchema');

const env = process.env;

let poolpzAccumulator = async (sendreq) => {
    const generalDbConnection = await connectWithGeneralDb();
    const GameAccsSchema = createGameAccsModel(generalDbConnection);

    const cktDbConnection = await connectWithCricketDb();
    const CktTeamMetaDataSchema = createCktTeamMetaDataModel(cktDbConnection);

    const dbName = sendreq.userData.dbName;
    const vendorDbConnection = await connectWithVendorDb(dbName);
    const JoinAccTeamsSchema = createJoinAccTeamsModel(vendorDbConnection);

    let sendResponse = {};

    let upcomingSchema = null;
    let upcomCondi = {};
    let sjoinedGameSchema = null;
    let userplym = "";
    let gametype = "";
    let fantasypnt = "";
    let teamfantpointsSchema = null;

    //////////////////

    let teammetadatas = null;

    console.log("sendreq--->>", sendreq);
    //////////////////
    
    if (sendreq.type === "cricket") {
        const CktTeamFantasyPointsSchema = createCktTeamFantasyPointsModel(cktDbConnection);
        const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);

        upcomingSchema = CktLeaguesSchema;
        upcomCondi = { "cid": parseInt(sendreq.league_id) };
        sjoinedGameSchema = JoinAccTeamsSchema;
        userplym = "user_players_series_ckts";
        teamDetail = "ckt_teams";
        seriesmetadatas = "ckt_series_meta_data";
        gametype = "ckt";
        fantasypnt = "ckt_team_fantasy_points";
        teammetadatas = CktTeamMetaDataSchema; //Todo: Not using
        teamfantpointsSchema = CktTeamFantasyPointsSchema;
    } else if (sendreq.type === "football") {
        const footballDbConnection = await connectWithFootballDb();
        const FbTeamFantasyPointsSchema = createFbTeamFantasyPointsModel(footballDbConnection);
        const FbLeaguesSchema = createFbLeaguesModel(footballDbConnection);

        upcomingSchema = FbLeaguesSchema;
        upcomCondi = { "season_id": parseInt(sendreq.league_id) };
        sjoinedGameSchema = JoinAccTeamsSchema;
        userplym = "user_players_series_ckts";
        teamDetail = "fb_teams";
        seriesmetadatas = "fb_series_meta_datas";
        gametype = "fb";
        fantasypnt = "fb_team_fantasy_points";
        teammetadatas = CktTeamMetaDataSchema; //Todo: Not using
        teamfantpointsSchema = FbTeamFantasyPointsSchema;
    }


    let gameaccs = await GameAccsSchema.findOne({ gamekey: "pzpool" });
    let upcomingList = await upcomingSchema.findOne(upcomCondi);



    if (gameaccs && gameaccs.prize) {
        // upcomingList.forEach(async (item, indexUpc) => {
        let item = Object.assign({}, upcomingList)

        let joinCondi = { gamekey: "pzpool", gametype: gametype };
        let tmfpCond = {}
        let league_id_key = "";
        let league_id = null;

        if (gametype === "ckt") {
            joinCondi["league_id"] = sendreq.league_id;
            tmfpCond["league_id"] = sendreq.league_id;
            league_id_key = "cid";
            league_id = sendreq.league_id;
        } else {
            joinCondi["league_id"] = sendreq.league_id;
            tmfpCond["season_id"] = sendreq.league_id;
            league_id_key = "season_id";
            league_id = sendreq.league_id;
        }
        console.log("joinCondi-->>", sendreq.league_id, joinCondi);

        let teamFantasy = await teamfantpointsSchema.aggregate([
            {
                $match: tmfpCond
            },
            {
                $group: { _id: { "team_id": "$team_id" }, team_id: { "$first": "$team_id" }, avg: { $avg: "$tp" } }
            },
            { "$sort": { "avg": -1 } },
            {
                $lookup:
                {
                    from: "join_acc_teams",
                    localField: "team_id",
                    foreignField: "team_id",
                    as: "joinsacctms",
                    pipeline: [
                        {

                            $match: joinCondi//{ league_id: 19699, gamekey: "pzpool", gametype: gametype }
                        }]

                }
            },
            {

                $unwind: {
                    "path": "$joinsacctms",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                $lookup:
                {
                    from: teamDetail,
                    localField: "team_id",
                    foreignField: "team_id",
                    as: "teamdata",
                    pipeline: [
                        {

                            $match: { season_id: league_id }//{ league_id: 19699, gamekey: "pzpool", gametype: gametype }
                        }]

                }
            },
            {

                $unwind: {
                    "path": "$teamdata",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                $project: {
                    jpoolid: "$joinsacctms._id",
                    userid: "$joinsacctms.userid",
                    league_id: "$joinsacctms.league_id",
                    sharecnt: "$joinsacctms.sharecnt",
                    team_id: "$joinsacctms.team_id",
                    "team_name": sendreq.type === "football" ? "$teamdata.name" : "$teamdata.team.title",
                    "team_logo": sendreq.type === "football" ? "$teamdata.logo_path" : "$teamdata.team.logo_url",
                    "totalpnt": "$avg"
                }
            }
        ])


        let totalUserShareAmt = 0;


        // playersFantasy.forEach((itemTotalShare) => {
        //     if (itemTotalShare["sharecnt"]) {
        //         totalUserShareAmt = totalUserShareAmt + (itemTotalShare["sharecnt"] * gameaccs.prize);
        //     }
        // })

        console.log("teamFantasy---->>>", teamFantasy);
        let totalShare = await sjoinedGameSchema.aggregate([{ $match: { "league_id": league_id } }, {
            $group:
                { _id: null, sum: { $sum: "$sharecnt" } }
        }])

        //console.log("totalShare--->>", totalShare && totalShare.length > 0 && totalShare[0]["sum"]);
        totalShare = totalShare && totalShare.length > 0 ? totalShare[0]["sum"] : 0

        let rankArray = [];
        //console.log("gameaccs-->>", gameaccs.prize);
        // passing the rank array and the teamFantasy to the giveRank() function
        let rankList = await giveRank(rankArray, teamFantasy, gameaccs.prize, totalUserShareAmt, sjoinedGameSchema, upcomingSchema, league_id, totalShare, sendreq);


        console.log("rankListIs----->>", rankList)
        sendResponse.teamAccData = rankList;

        let where = upcomCondi;

        //let findData = await teamDetailSchema.findOne(where, { teama: 1, teamb: 1 }).lean();
        sendResponse.seriesDetail = await upcomingSchema.findOne(where, {
            date_end: 1, date_start: 1, _id: 1,
            abbr: 1, category: 1, cid: 1, logo_url: 1, name: 1
        });
        //item = findData;

        //  let checkhttpurl = isValidHttpUrl(item.logo_url)
        //     console.log("item111",checkhttpurl)
        //     if (checkhttpurl) {
        //         item.image = item.logo_url
        //     } else {
        //         item.image = item.logo_url == null ? `${env.awsimgurl}profile_doc/undefined` :`${env.awsimgurl}profile_doc/${item.logo_url}`
        //     }

        sendResponse.coins_summry = {
            total_investment: totalUserShareAmt,
            Total_Winnings: 0,
            total_profit: 0
        }




        return sendResponse;
        //})
    }
}


// function for giving rank
let giveRank = async (arrayArg, resultArg, amtRankPerUser, totalUserShareAmt, sjoinedGameSchema, upcomingSchema, league_id, totalShare, sendreq) => {


    try {

        let unique = [...new Set(resultArg.map(item => item.totalpnt))];
        unique.sort(function (a, b) { return b - a });

        let resultArgNew = [];
        let cnt = 0;
        unique.forEach((itemPnt, index) => {
            let postData = resultArg.filter(x => x.totalpnt == itemPnt);
            postData.forEach((itemData) => {
                itemData["position"] = index + 1
                ////console.log("sharecnt, amtRankPerUser--->>", cnt++, (itemData["sharecnt"] ? itemData["sharecnt"] : itemData), amtRankPerUser);

                resultArgNew.push(itemData);
            })
        })


        let findTopFourUserShare = resultArgNew.filter(x => x.position <= 1);

        totalUserShareAmt = totalShare * amtRankPerUser;
        let topFourUserShare = 0;
        findTopFourUserShare.forEach((itemTop4) => {
            if (itemTop4["sharecnt"]) {
                topFourUserShare = topFourUserShare + itemTop4["sharecnt"]
            }
        })

        let perUseAmtDistribute = (topFourUserShare) ? totalUserShareAmt / topFourUserShare : 0;

        let totalWinDistributeToUser = 0;
        sendreq.status === 3 && resultArgNew.forEach((itemPerAmt) => {
            if (itemPerAmt["sharecnt"] && itemPerAmt["position"] <= 1) {
                ////console.log("position--->>", itemPerAmt["position"], winPerc[itemPerAmt["position"]]);
                let winPerAmt = winPerc[itemPerAmt["position"]] * perUseAmtDistribute / 100;
                //console.log("winPerAmt-->>", itemPerAmt["position"], winPerAmt);
                itemPerAmt["famt"] = (itemPerAmt["sharecnt"] && winPerAmt) ? (itemPerAmt["sharecnt"] * winPerAmt).toFixed(0) : 0;
                totalWinDistributeToUser = totalWinDistributeToUser + itemPerAmt["famt"];
                //////console.log("famt,totalWinDistributeToUser-------------->>>",itemPerAmt["sharecnt"],winPerAmt,perUseAmtDistribute,totalWinDistributeToUser);
            }
        })
        return resultArgNew;
    } catch (err) {
        ////console.log("err--->>>", err);
    }
}


let match_cricket_pool_contest_list = async (req) => {
    console.log("req.userData.apikey====>>", req.userData.apikey);
    const cktDbConnection = await connectWithCricketDb();
    const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);
    const CricketPlayersSchema = createCricketPlayersModel(cktDbConnection);

    const dbName = req.userData.dbName;
    const vendorDbConnection = await connectWithVendorDb(dbName);
    const JoinMatchContestsSchema = createJoinMatchContestsModel(vendorDbConnection);
    const UserTeamCktSchema = createUserTeamCktModel(vendorDbConnection);

    let playersSchema = CricketPlayersSchema;
    let userTeamSchema = UserTeamCktSchema;
    let joinContSchema = JoinMatchContestsSchema;
    let gametype = "ckt", type = "m";
    let upcomingdatestart = UpcomingCricketsSchema;
    return await matchCricketContestList(req, playersSchema, userTeamSchema, joinContSchema, gametype, type, upcomingdatestart);
}

let match_football_pool_contest_list = async (req) => {
    const footballDbConnection = await connectWithFootballDb();
    const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);
    const FbPlayersSchema = createFbPlayersModel(footballDbConnection);

    const dbName = req.userData.dbName;
    const vendorDbConnection = await connectWithVendorDb(dbName);
    const JoinMatchContestsSchema = createJoinMatchContestsModel(vendorDbConnection);
    const UserTeamFbSchema = createUserTeamFbModel(vendorDbConnection);

    const playersSchema = FbPlayersSchema;
    const userTeamSchema = UserTeamFbSchema;
    const joinContSchema = JoinMatchContestsSchema;
    const gametype = "fb", type = "m";
    const upcomingdatestart = FbUpcomingsSchema;

    return await matchCricketContestList(req, playersSchema, userTeamSchema, joinContSchema, gametype, type, upcomingdatestart);
}

let series_cricket_pool_contest_list = async (req) => {
    const cktDbConnection = await connectWithCricketDb();
    const CricketPlayersSchema = createCricketPlayersModel(cktDbConnection);

    const dbName = req.userData.dbName;
    const vendorDbConnection = await connectWithVendorDb(dbName);
    const JoinContestsSchema = createSeriesJoinContestsModel(vendorDbConnection);
    const UserCktLeagueSchema = createUserCktLeagueModel(vendorDbConnection);

    const playersSchema = CricketPlayersSchema;
    const userTeamSchema = UserCktLeagueSchema;
    const joinContSchema = JoinContestsSchema;
    const gametype = "ckt", type = "s";
    return await matchCricketContestList(req, playersSchema, userTeamSchema, joinContSchema, gametype, type, null);
}

let series_football_pool_contest_list = async (req) => {
    const footballDbConnection = await connectWithFootballDb();
    const FbPlayersSchema = createFbPlayersModel(footballDbConnection);

    const dbName = req.userData.dbName;
    const vendorDbConnection = await connectWithVendorDb(dbName);
    const JoinContestsSchema = createSeriesJoinContestsModel(vendorDbConnection);
    const UserFbLeagueSchema = createUserFbLeagueModel(vendorDbConnection);

    const playersSchema = FbPlayersSchema;
    const userTeamSchema = UserFbLeagueSchema;
    const joinContSchema = JoinContestsSchema;
    const gametype = "fb", type = "s";

    return await matchCricketContestList(req, playersSchema, userTeamSchema, joinContSchema, gametype, type, null);
}

let filter_contest_ckt = async (req) => {
    const cktDbConnection = await connectWithCricketDb();
    const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);
    const CricketPlayersSchema = createCricketPlayersModel(cktDbConnection);

    const dbName = req.userData.dbName;
    const vendorDbConnection = await connectWithVendorDb(dbName);
    const JoinMatchContestsSchema = createJoinMatchContestsModel(vendorDbConnection);
    const UserTeamCktSchema = createUserTeamCktModel(vendorDbConnection);

    let playersSchema = CricketPlayersSchema;
    let userTeamSchema = UserTeamCktSchema;
    let joinContSchema = JoinMatchContestsSchema;
    let gametype = "ckt", type = "m";
    let upcomingdatestart = UpcomingCricketsSchema;
    return await matchCricketContestList(req, playersSchema, userTeamSchema, joinContSchema, gametype, type, upcomingdatestart);
}

let matchCricketContestList = async (req, playersSchema, userTeamSchema, joinContSchema, gametype, type, upcomingdatestart) => {
    return new Promise(async (resolve, reject) => {
        try {
            const dbName = req.userData.dbName;//Todo: We need to check the is dbName is comming or not
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const ContestsSchema = createContestsModel(vendorDbConnection);

            const params = req;
            //params.userid = 21;//req.user.id;
            let limit = (req.page) ? parseInt(req.limit) : 4;
            let page = (req.page) ? parseInt(req.page) : 0;
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

            let letSendTeamData = {}
            let date_start = {};

            console.log("where-->>",where,type);
            if (type == "m") {
                // if (gametype == "ckt") {
                //let findData = await playersSchema.find(where, { teama: 1, teamb: 1 }).lean()
                date_start = await upcomingdatestart.findOne(where, { date_start_ist: 1,teama:1,teamb:1 }).lean()
                console.log("date_start--->>",date_start);
                letSendTeamData = {
                    teama_id: date_start?.teama?.team_id,
                    teamb_id: date_start?.teamb?.team_id,
                    teama: date_start?.teama?.name,
                    teamalogo: date_start?.teama?.logo_url,
                    teamb: date_start?.teamb?.name,
                    teamblogo: date_start?.teamb?.logo_url,
                    date_start: date_start?.date_start_ist
                }


                if (letSendTeamData) {
                    let TeamMetaDataSchema=null;
                    if (gametype == "ckt") {
                    const cktDbConnection = await connectWithCricketDb();
                        TeamMetaDataSchema = createCktTeamMetaDataModel(cktDbConnection);
                    }else{
                        const fbDbConnection = await connectWithFootballDb();
                        TeamMetaDataSchema = createFbTeamMetaDatasModel(fbDbConnection);
                    }
                    let teammetadata = await TeamMetaDataSchema.find({ "team_id": { "$in": [letSendTeamData.teama_id, letSendTeamData.teamb_id] } });


                    let teamLogo = {};
                    teammetadata?.map(item => {
                        teamLogo[item.team_id] = `${env.awsimgurl}profile_doc/${item.logo_url}`
                    })

                    if (teamLogo.length > 0) {
                        letSendTeamData.teamalogo = (teamLogo[letSendTeamData.teama_id]) ? teamLogo[letSendTeamData.teama_id]?.teamLogo : "";
                        letSendTeamData.teamblogo = (teamLogo[letSendTeamData.teamb_id]) ? teamLogo[letSendTeamData.teamb_id]?.teamLogo : "";
                    }

                }

                // }
            } else if (type == "s") {
                let findData = {}
                if (gametype == "ckt") {
                    let send_array = { cid: where.league_id }
                    findData = await cktleague.findOne(send_array);

                    let checkhttpurl = (findData.logo_url) ? isValidHttpUrl(findData.logo_url) : null;
                    if (checkhttpurl) {
                        findData.logo_url = findData.logo_url
                    } else {
                        findData.logo_url = `${env.awsimgurl}profile_doc/${findData.logo_url}`
                    }
                    // return (findData)
                    let league_array = { league_id: where.league_id }
                    let itemLogo = await cktseriesmetadatas.findOne(league_array);

                    letSendTeamData = {
                        title: findData.name,
                        logo_url: (itemLogo && itemLogo.logo_url) ? `${env.awsimgurl}profile_doc/${itemLogo.logo_url}` : findData.logo_url,
                        date_start: findData.date_start
                    }

                } else if (gametype == "fb") {
                    let send_array = { season_id: where.league_id }
                    findData = await fbleagues.findOne(send_array)


                    let checkhttpurl = (findData && findData.logo_url) ? isValidHttpUrl(findData.logo_url) : null;
                    if (checkhttpurl) {
                        findData.logo_url = findData.logo_url
                    } else {
                        findData.logo_url = `${env.awsimgurl}profile_doc/${findData.logo_url}`
                    }

                    if (findData) {
                        letSendTeamData = {
                            title: findData.name,
                            logo_url: findData.logo_path,
                            date_start: findData.date_start
                        }
                    }

                }

            }
            let sendResponse = {};
            let filterData = {};

            filterData[m_s_id] = parseInt(params[m_s_id]);
            //fitler for number of teams
            if (req.uptojoinmin && req.uptojoinmax) {
                filterData["uptojoin"] = { "$gte": req.uptojoinmin, "$lte": req.uptojoinmax };
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

            filterData["isChecked"] = 1;
            filterData["status"] = 1;
            filterData["ispoolfull"] = { "$ne": 1 };
            filterData["isprivate"] = 0;

            if (params.contestid && params.contestid != '') {
                filterData["_id"] = ObjectId(params.contestid);
            }

            console.log("filterDatafilterData--->",filterData);
            
            let queryObj = [];
            if (type === "s") {
                queryObj = [
                    {
                        $sort: { sortodr: 1 }
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
                                {
                                    $lookup:
                                    {
                                        from: "contest_series",
                                        localField: "contest_id",
                                        foreignField: "contest_id",
                                        as: "contestseries",
                                        pipeline: [
                                            {
                                                $match: where//{"league_id":where.league_id}
                                            },

                                        ]
                                    }

                                },
                                {
                                    $unwind: {
                                        "path": "$contestseries",
                                        "preserveNullAndEmptyArrays": true
                                    }
                                },

                            ]
                        },

                    },


                    {
                        $project: {
                            moreThanFive: { $gt: [{ $size: "$poollist" }, 0] },
                            dis_val: 1, status: 1, title: 1, subtitle: 1, favcontest: 1, isprivate: 1, teama: 1, "poollist.uptojoin": 1, "poollist.joineduser": 1, "poollist.joinfee": 1, "poollist.totalwinamt": 1, "poollist.winners": 1, "poollist.maxteams": 1, ["poollist." + m_s_id]: 1, "poollist._id": 1, "poollist.status": 1, "poollist.type": 1, "poollist.ispoolfull": 1, "poollist.iscancel": 1, "poollist.gtype": 1, "poollist.isprivate": 1, "poollist.privatename": 1, "poollist.c": 1, "poollist.m": 1, "poollist.s": 1, "poollist.poolpb.pmin": 1, "poollist.poolpb.pmax": 1, "poollist.poolpb.pamount": 1, "poollist.poolpb._id": 1
                            , "poollist.usable_bonus_percentage": 1, "poollist.contestseries": 1,

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
                queryObj = [
                    {
                        $sort: { sortodr: 1 }
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

                                }


                            ]
                        },

                    },


                    {
                        $project: {
                            moreThanFive: { $gt: [{ $size: "$poollist" }, 0] },
                            dis_val: 1, status: 1, title: 1, subtitle: 1, favcontest: 1, isprivate: 1, teama: 1, "poollist.uptojoin": 1, "poollist.joineduser": 1, "poollist.joinfee": 1, "poollist.totalwinamt": 1, "poollist.winners": 1, "poollist.maxteams": 1, ["poollist." + m_s_id]: 1, "poollist._id": 1, "poollist.status": 1, "poollist.type": 1, "poollist.ispoolfull": 1, "poollist.iscancel": 1, "poollist.gtype": 1, "poollist.isprivate": 1, "poollist.privatename": 1, "poollist.c": 1, "poollist.m": 1, "poollist.s": 1, "poollist.poolpb.pmin": 1, "poollist.poolpb.pmax": 1, "poollist.poolpb.pamount": 1, "poollist.poolpb._id": 1
                            , "poollist.usable_bonus_percentage": 1

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
            
            await ContestsSchema.aggregate(queryObj).then((result) => {

                let dataContest = [];
                result[0]["data"].forEach((item) => {
                    if (item.poollist.length > 0) {
                        dataContest.push(item);
                    }
                })

                let timeZoneSet = (req.timezone) ? req.timezone : null;
                letSendTeamData["date_start"] = dateTimeZone(letSendTeamData["date_start"], timeZoneSet)//timeChange(req.user.id,letSendTeamData["date_start"]);

                sendResponse = {
                    contestData: "",
                    matchDetail: letSendTeamData,
                    totalCount: (result?.[0]?.["total_count"]?.[0]?.["count"]) ? result?.[0]?.["total_count"]?.[0]?.["count"] : 0,

                }
                sendResponse.contestData = { "data": dataContest } //result[0]["data"] };
                resolve(response(sendResponse, "Data found succesfully.!!!", true))

            }).catch((e) => {
                response({}, "Something went wrong.!!!", false, null, e.stack)
                resolve(response);
            })



        } catch (error) {
            //console.log("errorerrorerrorerror",error);
            response({}, "Something went wrong.!!!", false, null, error.stack);
            resolve(response);
        }
    })
}



module.exports = {
    poolpzAccumulator, match_cricket_pool_contest_list,
    match_football_pool_contest_list, series_cricket_pool_contest_list,
    series_football_pool_contest_list, filter_contest_ckt
};