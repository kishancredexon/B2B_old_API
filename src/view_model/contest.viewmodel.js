let sdb = require("../../models");
const { ObjectId, ObjectID } = require("mongodb");
const response = require("../../helper/response");
const env = process.env;
const { socket, socketConnection } = require("./Socket");
const { dateTimeChange, keyGen, currentTimeZoneDate } = require("../../helper/common");
const { connectWithCricketDb, connectWithFootballDb, connectWithVendorDb } = require("../../config/mongodb_connections");
const createCktLeaguesModel = require("../../mongo_models_new/credexon_cricket/CktLeaguesSchema");
const createUpcomingCricketModel = require("../../mongo_models_new/credexon_cricket/UpcomingCricketsSchema");
const createCricketPlayersModel = require("../../mongo_models_new/credexon_cricket/CktPlayerDetailsSchema");
const createCktSeriesMetaDataModel = require("../../mongo_models_new/credexon_cricket/CktSeriesMetaDataSchema");
const createCktMatchScoresModel = require("../../mongo_models_new/credexon_cricket/CktMatchScoresSchema");
const createFbUpcomingsModel = require("../../mongo_models_new/credexon_football/FbUpcomingsSchema");
const createFbSeriesMetaDatasModel = require("../../mongo_models_new/credexon_football/FbSeriesMetaDatasSchema");
const createFbLeaguesModel = require("../../mongo_models_new/credexon_football/FbLeaguesSchema");
const createContestSeriesModel = require("../../mongo_models_new/credexon_vendor/ContestSeriesSchema");
const createFbPlayersModel = require("../../mongo_models_new/credexon_football/FbPlayersSchema");
const createJoinMatchContestsModel = require("../../mongo_models_new/credexon_vendor/JoinMatchContestsSchema");
const createPoolModel = require("../../mongo_models_new/credexon_vendor/PoolSchema");
const createPoolPrizeBreaksModel = require("../../mongo_models_new/credexon_vendor/PoolPrizeBreaksSchema");
const createUserTeamCktModel = require("../../mongo_models_new/credexon_vendor/UserTeamCktSchema");
const createUserTeamFbModel = require("../../mongo_models_new/credexon_vendor/UserTeamFbSchema");
const { cacheStorageGet } = require("../../helper/redis_set_get");
const createSeriesJoinContestsModel = require("../../mongo_models_new/credexon_vendor/JoinSeriesContestsSchema");
const createFbScoresModel = require("../../mongo_models_new/credexon_football/FbScoresSchema");
const createCktPlayersFantasyPointsModel = require("../../mongo_models_new/credexon_cricket/CktPlayersFantasyPointsSchema");
const createFbPlayerFantasyPointsModel = require("../../mongo_models_new/credexon_football/FbPlayerFantasyPointsSchema");
const createUsersModel = require("../../mongo_models_new/credexon_vendor/UsersSchema");


let poolDetail = async (sendreq) => {
    try {
        const params = sendreq;
        const cktDbConnection = await connectWithCricketDb();
        const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);
        const CricketPlayersSchema = createCricketPlayersModel(cktDbConnection);
        const CktMatchScoresSchema = createCktMatchScoresModel(cktDbConnection);

        const footballDbConnection = await connectWithFootballDb();
        const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);
        const FbPlayersSchema = createFbPlayersModel(footballDbConnection);
        
        const dbName = sendreq.userData.dbName;
        const vendorDbConnection = await connectWithVendorDb(dbName);
        const JoinMatchContestsSchema = createJoinMatchContestsModel(vendorDbConnection);
        const PoolSchema = createPoolModel(vendorDbConnection);
        const PoolPrizeBreaksSchema = createPoolPrizeBreaksModel(vendorDbConnection);

        //params.userid = 168// req.user.id;
        let limit = 10// (req.query.page != undefined) ? parseInt(req.query.limit) : 4;
        let page = 1// (req.query.page != undefined) ? parseInt(req.query.page) : 0;
        let skip = page * limit;
        
        // let where = {

        //     id_: ObjectId(params.pool_id)
        // }
        params.match_id = parseInt(params.match_id);

        let schemaUpcomming = ((params.type === "cricket") ? UpcomingCricketsSchema : FbUpcomingsSchema);
        let currentStatus = await schemaUpcomming.findOne({ match_id: params.match_id }, { "rstatus": 1 });

        params.status =currentStatus.rstatus;

        let sendResponse = {
            poolData: '',
            leaderBoardData: '',
            matchDetail: '',
            // myLeaderBoardData: ''
        }

        let where = {
            match_id: parseInt(params.match_id)
        }

        console.log("params.--->>",params.pool_id,params);
        
        let poolList =await PoolSchema.aggregate(
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
                { $project: { _id: 1, joinfee: 1, totalwinamt: 1, winners: 1, maxteams: 1, c: 1, m: 1, s: 1, status: 1, favpool: 1, isChecked: 1, contest_id: 1, poolmaster_id: 1, match_id: 1, type: 1, isprivate: 1, iscpy: 1, ispoolfull: 1, iscancel: 1, countrytype: 1, gtype: 1, uptojoin: 1, joineduser: 1, privatename: 1, 'poolbreakpoint._id': 1, 'poolbreakpoint.pmin': 1, 'poolbreakpoint.pmax': 1, 'poolbreakpoint.pamount': 1, } },

            ])
            .then((result) => 
                {
                console.log("poolDetailresult--->>",result);
                let poolDetails = result[0];
                let poolbreakpoint = poolDetails.poolbreakpoint;//pArr

                let sm = 0;
                poolbreakpoint.map((item) => {
                    sm = sm + item["pamount"];
                    return sm;
                })
                result[0]["totalwinamt"] = sm;

                let arrObj = [];

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

                sendResponse.poolData = result



            }).catch((e) => {

                response({}, "Something went wrong222.!!!", false, null, e.stack)
                // return resolve(e);
            })


        let userPlyS = "", plyrfantpoints = "", teamDetailSchema = null, upcomingMatchSchema = null;
        let scoreUpdateSchema = null,playersFantasyPointsSchema=null;

        if (params.type == "cricket") {
            let CktPlayersFantasyPointsSchema=createCktPlayersFantasyPointsModel(cktDbConnection);

            userPlyS = "user_player_match_ckts";
            plyrfantpoints = "ckt_players_fantasy_points";
            teamDetailSchema = CricketPlayersSchema;
            upcomingMatchSchema = UpcomingCricketsSchema;
            scoreUpdateSchema = CktMatchScoresSchema;
            playersFantasyPointsSchema=CktPlayersFantasyPointsSchema;

        } else if (params.type == "football") {
            const FbScoresSchema = createFbScoresModel(footballDbConnection);
            const FbPlayersFantasyPointsSchema=createFbPlayerFantasyPointsModel(footballDbConnection);

            userPlyS = "user_player_match_fbs";
            plyrfantpoints = "fbplyrfantpoints";
            teamDetailSchema = FbPlayersSchema;
            upcomingMatchSchema = FbUpcomingsSchema;
            scoreUpdateSchema = FbScoresSchema;
            playersFantasyPointsSchema=FbPlayersFantasyPointsSchema;
        }

        await JoinMatchContestsSchema.aggregate([
            {
                $match: { "match_id": parseInt(params.match_id), "poolid": ObjectId(params.pool_id) }
            },
            {
                $lookup:
                {
                    from: "users",
                    localField: "userid",
                    foreignField: "_id",
                    as: "userdetail"
                }
            },
            { $unwind: "$userdetail" },
            {
                $lookup:
                {
                    from: userPlyS,
                    localField: "uteamid",
                    foreignField: "uteamid",
                    as: "userteam",
                    pipeline: [
                        { $match: { "match_id": parseInt(params.match_id)} },

                    ]
                }
            },
            { $unwind: "$userteam" },

            // {
            //     $lookup:
            //     {
            //         from: plyrfantpoints,
            //         localField: "userteam.pid",
            //         foreignField: "pid",
            //         as: "fantasypnt",
            //         pipeline: [
            //             { $match: { "match_id": parseInt(params.match_id) } },
            //         ]
            //     }
            // },
            // {
            //     $unwind: {
            //         "path": "$fantasypnt",
            //         "preserveNullAndEmptyArrays": true
            //     }
            // },


            {
                $group: {
                    "_id": "$_id", team_no: { $first: "$userteam.team_no" }, jpoolid: { $first: "$_id" }, userid: { $first: "$userid" }, uteamid: { $first: "$uteamid" }, match_id: { $first: "$match_id" },
                    poolid: { $first: "$poolid" }, winamt: { $first: "$winamt" }, position: { $first: "$rank" }, //"totalpnt": { $sum: "$fantasypnt.tp" },
                    "name":{ $first: "$userdetail.username" },"email":{ $first: "$userdetail.email" },
                    "profilepic":{$first: "$userdetail.profilepic" },
                    jpooltp:{ $first: "$totalpnt" },jpoolwin:{ $first: "$winamt" },jpoolrank:{ $first: "$rank" },
                    all_pids: { $push: "$userteam.pid" }

                }
            },
            { "$sort": { "totalpnt": -1 } }
        ])
            .then(async (result) => {
                let PidFantPnt={};
                /////////////////////

                if (params.status != 1) {

                    if(params.status==2){
                        let fantasyPnts=await playersFantasyPointsSchema.find({"match_id":parseInt(params.match_id)},{"pid":1,"tp":1});
                        
                        fantasyPnts.forEach(item=>{
                            PidFantPnt[item.pid]=item.tp;
                        })

                        console.log("PidFantPnt--->>",JSON.stringify(PidFantPnt));
                        
                    }

                    let rankArray = [];
                    // populating the rank array with the marks
                    for (let i = 0; i < result.length; i++) {
                        
                        if(params.status==2){
                            let totalUIdPnt=0;
                            result[i]["all_pids"].forEach(itemSumPid=>{
                                
                                totalUIdPnt=totalUIdPnt+(PidFantPnt[itemSumPid] || 0);
                            })
                            console.log("totalUIdPnt--->>",totalUIdPnt);
                            result[i]['totalpnt']= totalUIdPnt
                            rankArray[i] = result[i]['totalpnt'];
                        }
                        if(params.status==3){
                            result[i]['totalpnt']=result[i]['jpooltp'];
                            result[i]['winamt']=result[i]['jpoolwin'];
                            result[i]['rank']=result[i]['jpoolrank'];
                        }
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

                    if(params.status==2){
                        console.log("rankList--->>",JSON.stringify(result));
                        console.log("rankArray--->>",JSON.stringify(rankArray));
                    // passing the rank array and the playersFantasyset to the giveRank() function
                    let rankList = await giveRank(rankArray, result, amtRankPerUser);
                    
                    result = rankList;
                    }
                    // let finalResult = [];

                }
                //////////////////////////
                console.log("result-->>",params,result)
                let allArray = await Promise.all(result.map(async (item) => {
                    return new Promise(async (resolve, reject) => {
                        (params.status === 1) && delete item.position;
                        (params.status === 1 || params.status === 2) && delete item.winamt;

                        //let profile_detail = await db.Userprofile.findOne({ where: { userid: item.userid } })


                        //item.name = profile_detail ? profile_detail.name : "";
                        //item.email = profile_detail ? profile_detail.email : "";
                        let profilepic = (item?.profilepic) ? (`${env.awsimgurl}profile_doc/${item?.profilepic}`) : "";
                        item.profilepic = profilepic;
                        // item.profilepic = profile_detail ? profile_detail.profilepic : null;
                        // item.teamname = profile_detail ? profile_detail.teamname : null;
                        resolve(item);

                    })
                }))

                
                let myleaderBoardData = [];

                /////////////////////////////
                // for(let i=0;i<allArray.length;i++){
                //         if (allArray[i].userid == params.userid) {
                //             myleaderBoardData.push(allArray[i])
                //         } else {
                //             leaderBoardData.push(allArray[i])
                //         }
                // }
                ///////////////////////////////////////

                sendResponse.leaderBoardData = allArray; //leaderBoardData;
                sendResponse["myleaderBoardData"] = myleaderBoardData;
            }).catch((e) => {

                //return res.status(400).send(response({}, "Something went wrong11.!!!", false))
                // return resolve(e);
            })


        letSendTeamData = {

        }
        let upcomingMatch = await upcomingMatchSchema.findOne(where)
        //findData.map((item) => {
            sendResponse.matchDetail = {
                teama: upcomingMatch?.teama?.name,
                teamalogo: upcomingMatch?.teama?.logo_url,
                teamb: upcomingMatch?.teamb?.name,
                teamblogo: upcomingMatch.teamb.logo_url,
                teama_id: upcomingMatch?.teama?.team_id,
                teamb_id: upcomingMatch?.teamb?.team_id,
            }
        //})

        
        let date_start = upcomingMatch?.date_start_ist
        sendResponse.matchDetail.date_start = date_start



        //////////////////


        let scoreData = await scoreUpdateSchema.findOne(where);
        if (sendreq.type == "cricket") {
            sendResponse.match_score = {
                team_a: { "scores": scoreData?.teama?.scores, "overs": scoreData?.teama?.overs },
                team_b: { "scores": scoreData?.teamb?.scores, "overs": scoreData?.teamb?.overs }
            }
        } else {
            sendResponse.match_score = scoreData?.scores;
        }


        return sendResponse;

    } catch (error) {
        console.log("error--->>", error);
        return {};//response({}, "Something went wrong.!!!", false);

    }
}


let poolDetailSeriesOld = async (sendreq) => {
    try {
        const cktDbConnection = await connectWithCricketDb();
        const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);
        const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);
        const CricketPlayersSchema = createCricketPlayersModel(cktDbConnection);
        const CktSeriesMetaDataSchema = createCktSeriesMetaDataModel(cktDbConnection);

        const footballDbConnection = await connectWithFootballDb();
        const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);
        const FbPlayersSchema = createFbPlayersModel(footballDbConnection);
        const FbSeriesMetaDatasSchema = createFbSeriesMetaDatasModel(footballDbConnection);
        const FbLeaguesSchema = createFbLeaguesModel(footballDbConnection);

        const dbName = sendreq.userData.dbName;
        const vendorDbConnection = await connectWithVendorDb(dbName);
        const ContestSeriesSchema = createContestSeriesModel(vendorDbConnection);
        const JoinContestsSchema = createSeriesJoinContestsModel(vendorDbConnection);
        const PoolSchema = createPoolModel(vendorDbConnection);
        const PoolPrizeBreaksSchema = createPoolPrizeBreaksModel(vendorDbConnection);

        const params = sendreq;
        
        //params.userid = 168// req.user.id;
        let limit = 10// (req.query.page != undefined) ? parseInt(req.query.limit) : 4;
        let page = 1// (req.query.page != undefined) ? parseInt(req.query.page) : 0;
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

        let const_status = null, const_date_start = null;

        let where = {
            league_id: parseInt(params.league_id)
        }

        let poolData = await PoolSchema.aggregate(
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
                { $project: { _id: 1, joinfee: 1, totalwinamt: 1, winners: 1, maxteams: 1, c: 1, m: 1, s: 1, status: 1, favpool: 1, isChecked: 1, contest_id: 1, poolmaster_id: 1, league_id: 1, type: 1, isprivate: 1, iscpy: 1, ispoolfull: 1, iscancel: 1, countrytype: 1, gtype: 1, uptojoin: 1, joineduser: 1, 'poolbreakpoint._id': 1, 'poolbreakpoint.pmin': 1, 'poolbreakpoint.pmax': 1, 'poolbreakpoint.pamount': 1, } },

            ])

        //.then(async(result) => {
        let result = poolData;
        let poolDetails = result[0];

        let poolbreakpoint = poolDetails.poolbreakpoint;//pArr

        let sm = 0;
        poolbreakpoint.map((item) => {
            sm = sm + item["pamount"];
            return sm;
        })

        result[0]["totalwinamt"] = sm;

        let arrObj = [];

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

        let currentDates = currentTimeZoneDate();

        let contest_id = result[0]["contest_id"];
        let chkContSer = await ContestSeriesSchema.findOne({ "league_id": where.league_id, "contest_id": ObjectID(contest_id) });

        if (chkContSer.date_start <= currentDates && chkContSer.date_end >= currentDates) {
            const_status = "live";
            params.status = 2;
        } else if (chkContSer.date_start > currentDates) {
            const_status = "upcoming";
            params.status = 1;
        } else if (chkContSer.date_end < currentDates) {
            const_status = "result";
            params.status = 3;
        }


        /////////////////////////
        sendResponse.poolData = result

        sendResponse.const_status = const_status;
        sendResponse.const_date_start = chkContSer?.date_start;
        // }).catch((e) => {

        //     //return res.status(400).send(response({}, "Something went wrong222.!!!", false))
        //     // return resolve(e);
        // })


        let userPlyS = "", plyrfantpoints = "", teamDetailSchema = null, upcomingSeriesSchema = null,
            seriesmetadataSchema = null, upcomingMatchSchema = null;

        if (params.type == "cricket") {
            userPlyS = "user_players_series_ckts";
            plyrfantpoints = "ckt_players_fantasy_points";
            teamDetailSchema = CricketPlayersSchema;
            upcomingSeriesSchema = CktLeaguesSchema;
            seriesmetadataSchema = CktSeriesMetaDataSchema;
            upcomingMatchSchema = UpcomingCricketsSchema;

        } else if (params.type == "football") {
            userPlyS = "user_players_series_fbs";
            plyrfantpoints = "fb_player_fantasy_points";
            teamDetailSchema = FbPlayersSchema;
            upcomingSeriesSchema = FbLeaguesSchema;
            seriesmetadataSchema = FbSeriesMetaDatasSchema;
            upcomingMatchSchema = FbUpcomingsSchema;
        }

        let sDate = chkContSer.date_start;
        let eDate = chkContSer.date_end;

        let upcomingList = await upcomingMatchSchema.find({ "cid": where.league_id, "date_start_ist": { "$gte": sDate, "$lte": eDate } }, { match_id: 1 });
        let matchIds = [];
        upcomingList.forEach(itemMid => {
            matchIds.push(itemMid.match_id);
        })


        let playersFantasy = await JoinContestsSchema.aggregate([
            {
                $match: { "league_id": parseInt(params.league_id), "poolid": ObjectId(params.pool_id) }
            },
            {
                $lookup:
                {
                    from: userPlyS,
                    localField: "uteamid",
                    foreignField: "uteamid",
                    as: "userteam",
                    pipeline: [
                        // {
                        //     "$match":{"$or":[{"match_ids":{"$in":matchIds}},{"is_substitue":0}]}
                        // },
                        {
                            $lookup:
                            {
                                from: plyrfantpoints,
                                localField: "pid",
                                foreignField: "pid",
                                as: "fantasypnt",
                                pipeline: [{
                                    "$match": { "match_id": { "$in": matchIds } }
                                }]
                            }
                        },

                    ]
                }
            }
        ])


        //.then(async (result) => {
        let finalResult = [];

        /////////////////////
        let rankList = null;
        if (params.status != 1) {

            let rankArray = [];
            let amtRankPerUser = [];
            let plyFantasy = [];

            // populating the rank array with the marks
            for (let i = 0; i < playersFantasy.length; i++) {
                rankArray[i] = playersFantasy[i]['totalpnt'];
            }



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


                // populating the rank array with the marks
                for (let i = 0; i < playersFantasy.length; i++) {
                    let tpNo = matchIds?.length > 0 ? matchIds.length : 1;
                    let sUTeam = playersFantasy[i]['userteam'];
                    let ftp = 0;
                    let uTeamTp = 0;


                    for (let j = 0; j < sUTeam.length; j++) {
                        let sFant = sUTeam[j]["fantasypnt"];
                        for (let m = 0; m < sFant.length; m++) {
                            if (sUTeam[j]["allmatch_id"] && sUTeam[j]["allmatch_id"].indexOf(sFant[m]["match_id"]) > -1) {
                                if (sUTeam[j]["match_ids"].indexOf(sFant[m]["match_id"]) > -1) {

                                    ftp = ftp + sFant[m]["tp"];

                                }

                            } else {
                                if (sUTeam[j]["is_substitue"] == 0) {
                                    ftp = ftp + sFant[m]["tp"];

                                }
                            }

                        }

                    }
                    uTeamTp = ftp;
                    let objJnData = {
                        "jpoolid": playersFantasy[i]["_id"],
                        "userid": playersFantasy[i]["userid"],
                        "uteamid": playersFantasy[i]["uteamid"],
                        "poolid": playersFantasy[i]["poolid"],

                        "totalpnt": ftp,
                    };
                    if (params.status == 3) {
                        objJnData["winamt"] = playersFantasy[i]["winamt"];
                    }
                    plyFantasy.push(objJnData)

                }



                plyFantasy.sort((a, b) => b.totalpnt - a.totalpnt);

                for (let i = 0; i < plyFantasy.length; i++) {
                    rankArray[i] = plyFantasy[i]['totalpnt'];
                }
            }


            // passing the rank array and the playersFantasyset to the giveRank() function
            rankList = await giveRank(rankArray, plyFantasy, amtRankPerUser);


        } else {
            rankList = playersFantasy
        }

        const UsersSchema=createUsersModel(vendorDbConnection);

        let allArray = await Promise.all(rankList.map(async (item) => {
            return new Promise(async (resolve, reject) => {
                (params.status === 1) && delete item.position;
                (params.status === 1 || params.status === 2) && delete item.winamt;

                let profile_detail = await UsersSchema.findOne({ where: { userid: ObjectId(item.userid) } })


                item.name = profile_detail ? profile_detail.name : "";
                item.email = profile_detail ? profile_detail.email : "";
                // item.profilepic = profile_detail ? profile_detail.profilepic : null;
                let profilepic = (profile_detail && profile_detail.profilepic) ? (`${env.awsimgurl}profile_doc/${profile_detail?.profilepic}`) : "";
                item.profilepic = profilepic;
                // item.teamname = profile_detail ? profile_detail.teamname : null;

                resolve(item);

            })
        }))


        //////////////////////////
        //sendResponse.leaderBoardData = result
        // sendResponse.finalResult = finalResult
        let leaderBoardData = [];
        let myleaderBoardData = [];


        sendResponse.leaderBoardData = allArray;
        sendResponse["myleaderBoardData"] = myleaderBoardData;
        sendResponse.const_status = const_status;

        // }).catch((e) => {

        //     //return res.status(400).send(response({}, "Something went wrong11.!!!", false))
        //     // return resolve(e);
        // })







        //let findData = await teamDetailSchema.find(where, { teama: 1, teamb: 1 })

        letSendTeamData = {

        }
        // findData.map((item) => {
        //     sendResponse.matchDetail = {
        //         teama: item.teama.team.title,
        //         teamalogo: item.teama.team.thumb_url,
        //         teamb: item.teamb.team.title,
        //         teamblogo: item.teamb.team.thumb_url,
        //         teama_id: item?.teama?.team_id,
        //         teamb_id: item?.teamb?.team_id,
        //     }
        // })

        let leagueDetail = await upcomingSeriesSchema.findOne({ "cid": parseInt(params.league_id) })
        let leagueMeta = await seriesmetadataSchema.findOne({ "league_id": params.league_id })

        let date_start = leagueDetail?.date_start
        sendResponse.matchDetail = {
            "date_start": date_start,
            "title": leagueDetail?.name,
            "logo_url": (leagueMeta.logo_url) ? `${env.awsimgurl}profile_doc/${leagueMeta?.logo_url}` : `${env.awsimgurl}profile_doc/${leagueDetail?.logo_url}`,
            "status": leagueDetail.status,
            "seasonId": (params.type == "cricket") ? leagueDetail.season : leagueDetail.season_id,
        }

        return sendResponse;

    } catch (error) {
        //return res.status(400).send(response({}, "Something went wrong.!!!", false,null,error.stack));
        response({}, "Something went wrong.!!!", false);
    }
}

let poolDetailSeries = async (sendreq) => {
    try {
        const params = sendreq;
        const cktDbConnection = await connectWithCricketDb();
        const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);
        const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);
        const CricketPlayersSchema = createCricketPlayersModel(cktDbConnection);
        const CktMatchScoresSchema = createCktMatchScoresModel(cktDbConnection);
        const CktSeriesMetaDataSchema = createCktSeriesMetaDataModel(cktDbConnection);

        const footballDbConnection = await connectWithFootballDb();
        const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);
        const FbPlayersSchema = createFbPlayersModel(footballDbConnection);
        const FbLeaguesSchema = createFbLeaguesModel(footballDbConnection);
        const FbSeriesMetaDatasSchema = createFbSeriesMetaDatasModel(footballDbConnection);
        
        const dbName = sendreq.userData.dbName;
        const vendorDbConnection = await connectWithVendorDb(dbName);
        const JoinMatchContestsSchema = createSeriesJoinContestsModel(vendorDbConnection);
        const PoolSchema = createPoolModel(vendorDbConnection);
        const PoolPrizeBreaksSchema = createPoolPrizeBreaksModel(vendorDbConnection);

        //params.userid = 168// req.user.id;
        let limit = 10// (req.query.page != undefined) ? parseInt(req.query.limit) : 4;
        let page = 1// (req.query.page != undefined) ? parseInt(req.query.page) : 0;
        let skip = page * limit;
        
        // let where = {

        //     id_: ObjectId(params.pool_id)
        // }
        //params.match_id = parseInt(params.match_id);

        let schemaUpcomming = ((params.type === "cricket") ? CktLeaguesSchema : FbLeaguesSchema);
        let currentStatus = await schemaUpcomming.findOne({ match_id: params.match_id }, { "rstatus": 1 });

        params.status =currentStatus.rstatus;

        let sendResponse = {
            poolData: '',
            leaderBoardData: '',
            matchDetail: '',
            // myLeaderBoardData: ''
        }

        let where = {
            match_id: parseInt(params.match_id)
        }

        console.log("params.--->>",params.pool_id,params);
        
        let poolList =await PoolSchema.aggregate(
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
                { $project: { _id: 1, joinfee: 1, totalwinamt: 1, winners: 1, maxteams: 1, c: 1, m: 1, s: 1, status: 1, favpool: 1, isChecked: 1, contest_id: 1, poolmaster_id: 1, match_id: 1, type: 1, isprivate: 1, iscpy: 1, ispoolfull: 1, iscancel: 1, countrytype: 1, gtype: 1, uptojoin: 1, joineduser: 1, privatename: 1, 'poolbreakpoint._id': 1, 'poolbreakpoint.pmin': 1, 'poolbreakpoint.pmax': 1, 'poolbreakpoint.pamount': 1, } },

            ])
            .then((result) => 
                {
                console.log("poolDetailresult--->>",result);
                let poolDetails = result[0];
                let poolbreakpoint = poolDetails.poolbreakpoint;//pArr

                let sm = 0;
                poolbreakpoint.map((item) => {
                    sm = sm + item["pamount"];
                    return sm;
                })
                result[0]["totalwinamt"] = sm;

                let arrObj = [];

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

                sendResponse.poolData = result



            }).catch((e) => {

                response({}, "Something went wrong222.!!!", false, null, e.stack)
                // return resolve(e);
            })


        let userPlyS = "", plyrfantpoints = "", teamDetailSchema = null, upcomingMatchSchema = null;
        let scoreUpdateSchema = null,playersFantasyPointsSchema=null,seriesmetadataSchema = null;

        if (params.type == "cricket") {
            let CktPlayersFantasyPointsSchema=createCktPlayersFantasyPointsModel(cktDbConnection);

            userPlyS = "user_players_series_ckts";
            plyrfantpoints = "ckt_players_fantasy_points";
            teamDetailSchema = CricketPlayersSchema;
            upcomingMatchSchema = CktLeaguesSchema;
            scoreUpdateSchema = CktMatchScoresSchema;
            seriesmetadataSchema = CktSeriesMetaDataSchema;
            playersFantasyPointsSchema=CktPlayersFantasyPointsSchema;

        } else if (params.type == "football") {
            const FbScoresSchema = createFbScoresModel(footballDbConnection);
            const FbPlayersFantasyPointsSchema=createFbPlayerFantasyPointsModel(footballDbConnection);

            userPlyS = "user_players_series_fbs";
            plyrfantpoints = "fbplyrfantpoints";
            teamDetailSchema = FbPlayersSchema;
            upcomingMatchSchema = FbLeaguesSchema;
            scoreUpdateSchema = FbScoresSchema;
            playersFantasyPointsSchema=FbPlayersFantasyPointsSchema;
            seriesmetadataSchema = FbSeriesMetaDatasSchema;
        }

        await JoinMatchContestsSchema.aggregate([
            {
                $match: { "match_id": parseInt(params.match_id), "poolid": ObjectId(params.pool_id) }
            },
            {
                $lookup:
                {
                    from: "users",
                    localField: "userid",
                    foreignField: "_id",
                    as: "userdetail"
                }
            },
            { $unwind: "$userdetail" },
            {
                $lookup:
                {
                    from: userPlyS,
                    localField: "uteamid",
                    foreignField: "uteamid",
                    as: "userteam",
                    pipeline: [
                        { $match: { "match_id": parseInt(params.match_id)} },

                    ]
                }
            },
            { $unwind: "$userteam" },

            // {
            //     $lookup:
            //     {
            //         from: plyrfantpoints,
            //         localField: "userteam.pid",
            //         foreignField: "pid",
            //         as: "fantasypnt",
            //         pipeline: [
            //             { $match: { "match_id": parseInt(params.match_id) } },
            //         ]
            //     }
            // },
            // {
            //     $unwind: {
            //         "path": "$fantasypnt",
            //         "preserveNullAndEmptyArrays": true
            //     }
            // },


            {
                $group: {
                    "_id": "$_id", team_no: { $first: "$userteam.team_no" }, jpoolid: { $first: "$_id" }, userid: { $first: "$userid" }, uteamid: { $first: "$uteamid" }, match_id: { $first: "$match_id" },
                    poolid: { $first: "$poolid" }, winamt: { $first: "$winamt" }, position: { $first: "$rank" }, //"totalpnt": { $sum: "$fantasypnt.tp" },
                    "name":{ $first: "$userdetail.username" },"email":{ $first: "$userdetail.email" },
                    "profilepic":{$first: "$userdetail.profilepic" },
                    jpooltp:{ $first: "$totalpnt" },jpoolwin:{ $first: "$winamt" },jpoolrank:{ $first: "$rank" },
                    all_pids: { $push: "$userteam.pid" }

                }
            },
            { "$sort": { "totalpnt": -1 } }
        ])
            .then(async (result) => {
                let PidFantPnt={};
                /////////////////////

                if (params.status != 1) {

                    if(params.status==2){
                        let fantasyPnts=await playersFantasyPointsSchema.find({"match_id":parseInt(params.match_id)},{"pid":1,"tp":1});
                        
                        fantasyPnts.forEach(item=>{
                            PidFantPnt[item.pid]=item.tp;
                        })

                        console.log("PidFantPnt--->>",JSON.stringify(PidFantPnt));
                        
                    }

                    let rankArray = [];
                    // populating the rank array with the marks
                    for (let i = 0; i < result.length; i++) {
                        
                        if(params.status==2){
                            let totalUIdPnt=0;
                            result[i]["all_pids"].forEach(itemSumPid=>{
                                
                                totalUIdPnt=totalUIdPnt+(PidFantPnt[itemSumPid] || 0);
                            })
                            console.log("totalUIdPnt--->>",totalUIdPnt);
                            result[i]['totalpnt']= totalUIdPnt
                            rankArray[i] = result[i]['totalpnt'];
                        }
                        if(params.status==3){
                            result[i]['totalpnt']=result[i]['jpooltp'];
                            result[i]['winamt']=result[i]['jpoolwin'];
                            result[i]['rank']=result[i]['jpoolrank'];
                        }
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

                    if(params.status==2){
                        console.log("rankList--->>",JSON.stringify(result));
                        console.log("rankArray--->>",JSON.stringify(rankArray));
                    // passing the rank array and the playersFantasyset to the giveRank() function
                    let rankList = await giveRank(rankArray, result, amtRankPerUser);
                    
                    result = rankList;
                    }
                    // let finalResult = [];

                }
                //////////////////////////
                console.log("result-->>",params,result)
                let allArray = await Promise.all(result.map(async (item) => {
                    return new Promise(async (resolve, reject) => {
                        (params.status === 1) && delete item.position;
                        (params.status === 1 || params.status === 2) && delete item.winamt;

                        //let profile_detail = await db.Userprofile.findOne({ where: { userid: item.userid } })


                        //item.name = profile_detail ? profile_detail.name : "";
                        //item.email = profile_detail ? profile_detail.email : "";
                        let profilepic = (item?.profilepic) ? (`${env.awsimgurl}profile_doc/${item?.profilepic}`) : "";
                        item.profilepic = profilepic;
                        // item.profilepic = profile_detail ? profile_detail.profilepic : null;
                        // item.teamname = profile_detail ? profile_detail.teamname : null;
                        resolve(item);

                    })
                }))

                
                let myleaderBoardData = [];

                /////////////////////////////
                // for(let i=0;i<allArray.length;i++){
                //         if (allArray[i].userid == params.userid) {
                //             myleaderBoardData.push(allArray[i])
                //         } else {
                //             leaderBoardData.push(allArray[i])
                //         }
                // }
                ///////////////////////////////////////

                sendResponse.leaderBoardData = allArray; //leaderBoardData;
                sendResponse["myleaderBoardData"] = myleaderBoardData;
            }).catch((e) => {

                //return res.status(400).send(response({}, "Something went wrong11.!!!", false))
                // return resolve(e);
            })


        letSendTeamData = {

        }
        let upcomingMatch = await upcomingMatchSchema.findOne({ "cid": parseInt(params.league_id) });
        let leagueMeta = await seriesmetadataSchema.findOne({ "league_id": params.league_id })

        //findData.map((item) => {
            sendResponse.matchDetail = {
                "date_start": upcomingMatch?.date_start,
                "title": upcomingMatch?.name,
                "logo_url": (leagueMeta?.logo_url) ? `${env.awsimgurl}profile_doc/${leagueMeta?.logo_url}` : `${env.awsimgurl}profile_doc/${upcomingMatch?.logo_url}`,
                "status": upcomingMatch.status,
                "seasonId": (params.type == "cricket") ? upcomingMatch.season : upcomingMatch.season_id,
            }
        //})

        
        let date_start = upcomingMatch?.date_start_ist
        sendResponse.matchDetail.date_start = date_start



        //////////////////


        // let scoreData = await scoreUpdateSchema.findOne(where);
        // if (sendreq.type == "cricket") {
        //     sendResponse.match_score = {
        //         team_a: { "scores": scoreData?.teama?.scores, "overs": scoreData?.teama?.overs },
        //         team_b: { "scores": scoreData?.teamb?.scores, "overs": scoreData?.teamb?.overs }
        //     }
        // } else {
        //     sendResponse.match_score = scoreData?.scores;
        // }


        return sendResponse;

    } catch (error) {
        console.log("error--->>", error);
        return {};//response({}, "Something went wrong.!!!", false);

    }
}

let giveRank = async (arrayArg, resultArg, amtRankPerUser) => {
    return new Promise((resolve, reject) => {
        try {

            // declaring and initilising variables
            let rank = 1;
            let prev_rank = rank;
            let position = 0;
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
                    
                    //let filterAmt = amtRankPerUser.filter(x => x.pmin <= resultArg[i]["sno"] && x.pmax >= resultArg[i]["sno"])
                    //let perUsr = (filterAmt && filterAmt.length) ? filterAmt[0]["peramt"] : 0;
                    //resultArg[i]["peramt"] = resultArg[i]["winamt"]; //perUsr;


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
                    
                    //let filterAmt = amtRankPerUser.filter(x => x.pmin <= resultArg[i]["sno"] && x.pmax >= resultArg[i]["sno"])
                    //let perUsr = (filterAmt && filterAmt.length) ? filterAmt[0]["peramt"] : 0;
                    //resultArg[i]["peramt"] = resultArg[i]["winamt"]; //perUsr;


                    /*
                    Otherwise, if the value contained in `[i]` is equal to `[i-1]`,
                    assign the position the value stored in the `prev_rank` variable then increment the value stored in the `rank` variable.*/
                } else {
                    position = prev_rank;
                    rank++;
                    resultArg[i]["totalpnt"] = arrayArg[i];
                    resultArg[i]["position"] = position;
                    resultArg[i]["sno"] = i + 1;

                    
                    //let filterAmt = amtRankPerUser.filter(x => x.pmin <= resultArg[i]["sno"] && x.pmax >= resultArg[i]["sno"])
                    //let perUsr = (filterAmt && filterAmt.length) ? filterAmt[0]["peramt"] : 0;
                    //resultArg[i]["peramt"] = resultArg[i]["winamt"];//perUsr;

                }
            }

            
            resolve(resultArg);

        } catch (e) {
            resolve([]);
            //WriteErrorLogs("winningMCont", "giveRank", "", e);
        }
    })
}


let myPoolDetail = async (sendreq) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("userTeamSchemaparams--->>",sendreq);
            const dbName = sendreq.userData.dbName;
            
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const JoinMatchContestsSchema = createJoinMatchContestsModel(vendorDbConnection);
            const UserTeamCktSchema = createUserTeamCktModel(vendorDbConnection);
            const UserTeamFbSchema = createUserTeamFbModel(vendorDbConnection);

            const params = sendreq;
            
            params.match_id = parseInt(params.match_id);
            params.userid = ObjectId(params.userid);

            let gametype = (params.sportType === "Cricket" || params.sportType === "cricket") ? "ckt" : "fb";
            let userTeamSchema = (params.sportType === "Cricket" || params.sportType === "cricket") ? UserTeamCktSchema : UserTeamFbSchema;
            let myUsrTeam = await userTeamSchema.countDocuments({
                "match_id": parseInt(params.match_id),
                userid: params.userid
            })
            
            let joinContestCount = await JoinMatchContestsSchema.countDocuments({
                "match_id": parseInt(params.match_id),
                userid: params.userid, "gametype": gametype
            })
            
            let joinMCont = await JoinMatchContestsSchema.aggregate([{
             "$match":{ "match_id": params.match_id, "userid": params.userid }   
            },
            {
                "$group":{_id:{"poolid":"$poolid"},"poolid":{"$first":"$poolid"},"timesjoin":{"$sum":1}}
            }
        ]);
            //.distinct("poolid", { "match_id": params.match_id, "userid": params.userid })
            let poolIds = [];
            let timesjoinObj={};
            joinMCont.map((itemPId) => {
                timesjoinObj[itemPId.poolid.toString()]=itemPId.timesjoin;
                poolIds.push(itemPId.poolid.toString())
            });
            console.log("getRedisData--->>",poolIds);
            if (poolIds && poolIds.length > 0) {
                let gameTypeName=(gametype=="ckt")?"cricket":"football";
                let emit_detail = `match_${gameTypeName}_pool_contest_list_v2_${dbName}_${params.match_id}_m`;
                let getRedisData=await cacheStorageGet(emit_detail);
                console.log("getRedisData--->>",getRedisData);
                let allPoolData=(getRedisData)?JSON.parse(getRedisData):{};
                // socketConnection()
                // socket.emit(`match_${params.sportType}_pool_contest_list_v2`, { match_id: params.match_id, type: params.type, "authorization": sendreq.authorization });
                let myPoolList = [];
                let myTotalCount = 0;
                
                //socket.on(`match_${params.sportType}_pool_contest_list_v2_${dbkey}_${params.match_id}_${params.type}`, (globalMatch) => {
                    //globalMatch = (globalMatch) ? JSON.parse(globalMatch) : [];
                    //console.log("globalMatch==>>", globalMatch)

                    allPoolData?.data?.contestData?.data?.forEach((itemC, indexC) => {
                        itemC.poollist.forEach((itemPool) => {

                            if (poolIds.indexOf(itemPool._id) > -1) {
                                myTotalCount++;
                                itemPool["timesjoin"]=timesjoinObj[itemPool._id];
                                myPoolList.push(itemPool)

                            }

                        })

                        if ((indexC + 1) === allPoolData.data.contestData.data.length) {
                            let allData = {
                                "contestCount": joinContestCount,
                                "total_count": myTotalCount,
                                "mypicks": myUsrTeam,
                                "match_list": myPoolList
                            }
                            
                            resolve(response(allData, "Successfull fetch", true, myTotalCount))
                        }
                    })
                //});
            }
            else {
                let allData = {
                    "contestCount": joinContestCount,
                    "total_count": 0,
                    "mypicks": myUsrTeam,
                    "match_list": []
                }
                resolve(response(allData, "No Data", false, 0))
            }

        } catch (error) {
            console.log("error===>>", error);
            resolve(response({}, "Something went wrong.!!!", false));
        }
    })
}



module.exports = { poolDetail, poolDetailSeries, myPoolDetail }