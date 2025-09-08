const { winPerc, keyGen } = require("../../helper/common");
const { connectWithGeneralDb, connectWithCricketDb, connectWithFootballDb, connectWithVendorDb } = require("../../config/mongodb_connections");
const createGameAccsModel = require("../../mongo_models_new/credexon_general/GameAccsSchema");
const createCktTeamMetaDataModel = require("../../mongo_models_new/credexon_cricket/CktTeamMetaDataSchema");
const createCktPlayerMetaDataModel = require("../../mongo_models_new/credexon_cricket/CktPlayerMetaDataSchema");
const createUpcomingCricketModel = require("../../mongo_models_new/credexon_cricket/UpcomingCricketsSchema");
const createCricketPlayersModel = require("../../mongo_models_new/credexon_cricket/CktPlayerDetailsSchema");
const createCktPlayersFantasyPointsModel = require("../../mongo_models_new/credexon_cricket/CktPlayersFantasyPointsSchema");
const createCktPlayersModel = require("../../mongo_models_new/credexon_cricket/CktPlayersSchema");
const createCktMatchScoresModel = require("../../mongo_models_new/credexon_cricket/CktMatchScoresSchema");
const createFbUpcomingsModel = require("../../mongo_models_new/credexon_football/FbUpcomingsSchema");
const createFbPlayersModel = require("../../mongo_models_new/credexon_football/FbPlayersSchema");
const createFbTeamMetaDatasModel = require("../../mongo_models_new/credexon_football/FbTeamMetaDatasSchema");
const createFbScoresModel = require("../../mongo_models_new/credexon_football/FbScoresSchema");
const createFbPlayerDetailsModel = require("../../mongo_models_new/credexon_football/FbPlayerDetailsSchema");
const createFbPlayerFantasyPointsModel = require("../../mongo_models_new/credexon_football/FbPlayerFantasyPointsSchema");
const createJoinAccPlayersModel = require("../../mongo_models_new/credexon_vendor/JoinAccPlayersSchema");
const { ObjectId } = require("bson");
const createCricketPlayerDetailsModel = require("../../mongo_models_new/credexon_cricket/CktPlayerDetailsSchema");
const createFbPlayersMetaDataModel = require("../../mongo_models_new/credexon_football/FbPlayersMetaDataSchema");
const env = process.env;

//
let plyAccumulator = async (sendreq) => {
    const generalDbConnection = await connectWithGeneralDb();
    const GameAccsSchema = createGameAccsModel(generalDbConnection);

    
    const dbName = sendreq.userData.user.dbName;
    const vendorDbConnection = await connectWithVendorDb(dbName);
    const JoinAccPlayersSchema = createJoinAccPlayersModel(vendorDbConnection);

    let sendResponse = {};

    let sjoinedGameSchema = null;
    let userplym = "";
    let gametype = "";
    let plyrfantpoints = "";
    let playerDetail = "";
    let teamDetailSchema = null;
    let plymetadatas = "";
    let upcomingSchema = null;
    let teammetadatas = null;
    let scoreUpdateSchema = null;
    let playFantasySchema = null;
    let playersSchema = null;

    if (sendreq.type == "cricket") {
        const cktDbConnection = await connectWithCricketDb();
        const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);
        const CricketPlayersSchema = createCricketPlayersModel(cktDbConnection);
        const CktPlayerMetaDataSchema = createCktPlayerMetaDataModel(cktDbConnection);
        const CktTeamMetaDataSchema = createCktTeamMetaDataModel(cktDbConnection);
        const CktPlayersFantasyPointsSchema = createCktPlayersFantasyPointsModel(cktDbConnection);
        const CktPlayerDetailsSchema = createCricketPlayerDetailsModel(cktDbConnection);
        const CktMatchScoresSchema = createCktMatchScoresModel(cktDbConnection);

        sjoinedGameSchema = JoinAccPlayersSchema;
        teamDetailSchema = CricketPlayersSchema;
        upcomingSchema = UpcomingCricketsSchema;
        userplym = "user_player_match_ckts";
        plyrfantpoints = "ckt_players_fantasy_points";
        playerDetail = "ckt_players";
        gametype = "ckt";
        plymetadatas = CktPlayerMetaDataSchema;
        teammetadatas = CktTeamMetaDataSchema;
        scoreUpdateSchema = CktMatchScoresSchema;
        playFantasySchema = CktPlayersFantasyPointsSchema;
        playersSchema = CktPlayerDetailsSchema;
    } else if (sendreq.type == "football") {
        const footballDbConnection = await connectWithFootballDb();
        const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);
        const FbPlayersSchema = createFbPlayersModel(footballDbConnection);
        const FbTeamMetaDatasSchema = createFbTeamMetaDatasModel(footballDbConnection);
        const FbScoresSchema = createFbScoresModel(footballDbConnection);
        const FbPlayerDetailsSchema = createFbPlayerDetailsModel(footballDbConnection);
        const FbPlayerFantasyPointsSchema = createFbPlayerFantasyPointsModel(footballDbConnection)
        const FbPlayersMetaData=createFbPlayersMetaDataModel(footballDbConnection);

        sjoinedGameSchema = JoinAccPlayersSchema;
        teamDetailSchema = FbPlayersSchema;
        upcomingSchema = FbUpcomingsSchema;
        userplym = "user_player_match_fbs";
        plyrfantpoints = "fb_player_fantasy_points"
        playerDetail = "fb_player_details";
        gametype = "fb";
        plymetadatas = FbPlayersMetaData;
        teammetadatas = FbTeamMetaDatasSchema;
        scoreUpdateSchema = FbScoresSchema;
        playFantasySchema = FbPlayerFantasyPointsSchema;
        playersSchema = FbPlayerDetailsSchema;
    }

    let gameaccs = await GameAccsSchema.findOne({ gamekey: "plyacc" });

    let playersFantasy = null;

    playersFantasy = await sjoinedGameSchema.find({ "match_id": parseInt(sendreq.match_id), "gamekey": "plyacc", "gametype": gametype, "userid": ObjectId(sendreq.userid) },
    ).sort({"totalpnt": -1}).lean();


    let totalUserShareAmt = 0;
    let Total_Winnings = 0;
    let total_profit = 0;


    // playersFantasy.forEach((itemTotalShare) => {
    //     if (itemTotalShare["sharecnt"]) {
    //         totalUserShareAmt = totalUserShareAmt + (itemTotalShare["sharecnt"] * gameaccs.prize);
    //     }
    // })

    
    dataList = await Promise.all(playersFantasy.map(async (item) => {
        let itemPlyDetail=await playersSchema.findOne({"pid":item.pid});
        item["playerdata"]=itemPlyDetail;
        item.playerdata.logo_url =(sendreq.type == "cricket")?"": itemPlyDetail?.image_path;
        item.playerdata.title =(sendreq.type == "cricket")?itemPlyDetail?.short_name: itemPlyDetail?.common_name;
        let playerLogo = await plymetadatas.findOne({ pid: item.pid });
        if (playerLogo) {
            item["playerdata"]["logo_url"]=`${env.awsimgurl}profile_doc/${playerLogo.logo_url}`;
            return item;
        }
        
    }))

    console.log("playerdataplayerdataplayerdataplayerdata",dataList);
     
    let rankArray = [];
    // populating the rank array with the marks
    // for (let i = 0; i < playersFantasy.length; i++) {
    //     rankArray[i] = playersFantasy[i]['totalpnt'];
    // }

    // passing the rank array and the playersFantasyset to the giveRank() function
    let rankList = await giveRank(rankArray, playersFantasy, gameaccs.prize, totalUserShareAmt, sjoinedGameSchema, sendreq);

    let rankListNew = [];
    let totalShare = 0;
    rankList.resultArgNew.forEach(item => {
        //if (item.jpoolid) {
        totalShare = totalShare + item["sharecnt"];
        Total_Winnings = Total_Winnings + ((item["famt"]) ? item["famt"] : 0);
        rankListNew.push(item);
        //}
    })

    totalUserShareAmt = totalShare * gameaccs.prize;
    total_profit = (Total_Winnings - totalUserShareAmt)

    // Total_Winnings: Total_Winnings,
    //     total_profit: total_profit


    sendResponse.playAccData = rankListNew;
    sendResponse.totalShare = rankList.totalShare;

    let where = {
        match_id: parseInt(sendreq.match_id)
    }

    if (sendreq.type == "cricket") {

        //let findData = await teamDetailSchema.findOne(where, { teama: 1, teamb: 1 }).lean();
        let findUpcoming = await upcomingSchema.findOne(where);
        item = findUpcoming;
        //findData.map(async (item) => {
        let teamMetaA = await teammetadatas.findOne({ team_id: item.teama.team_id })
        let teamMetaB = await teammetadatas.findOne({ team_id: item.teamb.team_id })


        sendResponse.matchDetail = {
            teama_name: item.teama.name,
            teama_logo: (teamMetaA && teamMetaA.logo_url) ? `${env.awsimgurl}profile_doc/${teamMetaA.logo_url}` : item.teama.logo_url,
            teamb_name: item.teamb.name,
            teamb_logo: (teamMetaB && teamMetaB.logo_url) ? `${env.awsimgurl}profile_doc/${teamMetaB.logo_url}` : item.teamb.logo_url,
            teama_id: item?.teama?.team_id,
            teamb_id: item?.teamb?.team_id,

            ///////////////////////////
            date_end: findUpcoming.date_end_ist,
            date_start: findUpcoming.date_start_ist,
            league_name: findUpcoming.competition.title,
            match_id: findUpcoming.match_id,
            short_title: (((teamMetaA && teamMetaA.short_name) ? teamMetaA.short_name : item.teama.short_name) + " vs " + ((teamMetaB && teamMetaB.short_name) ? teamMetaB.short_name : item.teamb.short_name)),
            //teama_logo: "https://images.entitysport.com/assets/uploads/2020/12/Pakistan.png"
            //teama_name: "Pakistan"
            teama_short_name: (teamMetaA && teamMetaA.short_name) ? teamMetaA.short_name : item.teama.short_name,
            //teamb_logo: "https://images.entitysport.com/assets/uploads/2020/12/New_Zealand.png"
            //teamb_name: "New Zealand"
            teamb_short_name: (teamMetaB && teamMetaB.short_name) ? teamMetaB.short_name : item.teamb.short_name,
            title: findUpcoming.title,
        }
    } else {

        let findUpcoming = await upcomingSchema.findOne(where);
        item = findUpcoming;
        
        //findData.map(async (item) => {
        let teamMetaA = await teammetadatas.findOne({ team_id: item.teama.team_id })
        let teamMetaB = await teammetadatas.findOne({ team_id: item.teamb.team_id })

        sendResponse.matchDetail = {
            teama_name: item.teama.name,
            teama_logo: item.teama.logo_url,
            teamb_name: item.teamb.name,
            teamb_logo: item.teamb.logo_url,
            teama_id: item?.teama?.team_id,
            teamb_id: item?.teamb?.team_id,

            ///////////////////////////
            date_end: findUpcoming.date_end_ist,
            date_start: findUpcoming.date_start_ist,
            league_name: findUpcoming.league_name,
            match_id: findUpcoming.match_id,
            short_title: (((teamMetaA && teamMetaA.short_name) ? teamMetaA.short_name : item.teama.name) + " vs " + ((teamMetaB && teamMetaB.short_name) ? teamMetaB.short_name : item.teamb.name)),
            //teama_logo: "https://images.entitysport.com/assets/uploads/2020/12/Pakistan.png"
            //teama_name: "Pakistan"
            teama_short_name: (teamMetaA && teamMetaA.short_name) ? teamMetaA.short_name : item.teama.name,
            //teamb_logo: "https://images.entitysport.com/assets/uploads/2020/12/New_Zealand.png"
            //teamb_name: "New Zealand"
            teamb_short_name: (teamMetaB && teamMetaB.short_name) ? teamMetaB.short_name : item.teamb.name,
            title: item.teama.name + " vs " + item.teamb.name,
        }
    }

    sendResponse.coins_summry = {
        total_investment: totalUserShareAmt,
        Total_Winnings: Total_Winnings,
        total_profit: total_profit
    }

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
}

// function for giving rank
let giveRank = async (arrayArg, resultArg, amtRankPerUser, totalUserShareAmt, sjoinedGameSchema, sendreq) => {

    let unique = [...new Set(resultArg.map(item => item.totalpnt))];
    unique.sort(function (a, b) { return b - a });
    let resultArgNew = [];
    let cnt = 0;

    unique.forEach((itemPnt, index) => {
        let postData = resultArg.filter(x => x.totalpnt == itemPnt);

        postData.forEach((itemData) => {
            itemData["position"] = index + 1
            resultArgNew.push(itemData);

        })
    })


    let findTopFourUserShare = resultArgNew.filter(x => x.position <= 4);

    let shhh = 0;

    resultArgNew.forEach((itemSum) => {
        if (itemSum["sharecnt"]) {
            totalUserShareAmt = totalUserShareAmt + (itemSum["sharecnt"] * amtRankPerUser)
            shhh = shhh + itemSum["sharecnt"];
        }
    })

    let topFourUserShare = 0;
    findTopFourUserShare.forEach((itemTop4) => {
        if (itemTop4["sharecnt"]) {
            topFourUserShare = topFourUserShare + itemTop4["sharecnt"]
        }
    })


    let perUseAmtDistribute = (topFourUserShare) ? totalUserShareAmt / topFourUserShare : 0;
    let totalWinDistributeToUser = 0;
    resultArgNew.forEach((itemPerAmt) => {

        if (itemPerAmt["sharecnt"] && itemPerAmt["position"] <= 4) {
            if (sendreq.status == 1 || sendreq.status == 2) {
                itemPerAmt["famt"] = 0;
            }
            else {

                let winPerAmt = winPerc[itemPerAmt["position"]] * perUseAmtDistribute / 100;
                itemPerAmt["famt"] = (itemPerAmt && itemPerAmt["winamt"]) ? itemPerAmt["winamt"] : 0 //itemPerAmt["sharecnt"] * winPerAmt;
                totalWinDistributeToUser = totalWinDistributeToUser + itemPerAmt["famt"];

            }
        }
        //itemPerAmt["totalShareCnt"]=shhh;
    })

    return { resultArgNew, totalShare: shhh };

}

let plyAllAccumulator = async (sendreq) => {
    console.log("-----plyAllAccumulatorx-----", new Date());
    const generalDbConnection = await connectWithGeneralDb();
    const GameAccsSchema = createGameAccsModel(generalDbConnection);
    

    const dbName = sendreq.userData.user.dbName;
    const vendorDbConnection = await connectWithVendorDb(dbName);
    const JoinAccPlayersSchema = createJoinAccPlayersModel(vendorDbConnection);

    let sendResponse = {};

    let sjoinedGameSchema = null;
    let userplym = "";
    let gametype = "";
    let plyrfantpoints = "";
    let playerDetail = "";
    let teamDetailSchema = null;
    let plymetadatas = "";
    let upcomingSchema = null;
    let teammetadatas = null;
    let scoreUpdateSchema = null;
    let playFantasySchema = null;
    let playersSchema = null;
    
    
    if (sendreq.type == "cricket") {
        const cktDbConnection = await connectWithCricketDb();

        const CktTeamMetaDataSchema = createCktTeamMetaDataModel(cktDbConnection);
        const CktPlayersFantasyPointsSchema = createCktPlayersFantasyPointsModel(cktDbConnection);
        const CktPlayersSchema = createCktPlayersModel(cktDbConnection);
        const CktMatchScoresSchema = createCktMatchScoresModel(cktDbConnection);
        
        const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);
        const CricketPlayersSchema = createCricketPlayersModel(cktDbConnection);

        sjoinedGameSchema = JoinAccPlayersSchema;
        teamDetailSchema = CricketPlayersSchema;
        upcomingSchema = UpcomingCricketsSchema;
        userplym = "user_player_match_ckts";
        plyrfantpoints = "ckt_players_fantasy_points";
        playerDetail = "ckt_players";
        gametype = "ckt";
        plymetadatas = "ckt_player_meta_data";
        teammetadatas = CktTeamMetaDataSchema;
        scoreUpdateSchema = CktMatchScoresSchema;
        playFantasySchema = CktPlayersFantasyPointsSchema;
        playersSchema = CktPlayersSchema;
    } else if (sendreq.type == "football") {
        const footballDbConnection = await connectWithFootballDb();

        const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);
        const FbPlayersSchema = createFbPlayersModel(footballDbConnection);
        const FbTeamMetaDatasSchema = createFbTeamMetaDatasModel(footballDbConnection);
        const FbScoresSchema = createFbScoresModel(footballDbConnection);
        const FbPlayerDetailsSchema = createFbPlayerDetailsModel(footballDbConnection);
        const FbPlayerFantasyPointsSchema = createFbPlayerFantasyPointsModel(footballDbConnection)

        sjoinedGameSchema = JoinAccPlayersSchema;
        teamDetailSchema = FbPlayersSchema;
        upcomingSchema = FbUpcomingsSchema;
        userplym = "user_player_match_fbs";
        plyrfantpoints = "fb_player_fantasy_points"
        playerDetail = "fb_player_details";
        gametype = "fb";
        plymetadatas = "fb_players_meta_data";
        teammetadatas = FbTeamMetaDatasSchema;
        scoreUpdateSchema = FbScoresSchema;
        playFantasySchema = FbPlayerFantasyPointsSchema;
        playersSchema =FbPlayersSchema; //FbPlayerDetailsSchema;
    }

    let gameaccs = await GameAccsSchema.findOne({ gamekey: "plyacc" });

    let playersFantasy = null;
    let imagePath=`${env.awsimgurl}profile_doc/`
    if (sendreq.type == "cricket") {
        playersFantasy = await playersSchema.aggregate([
            {
                $match: { "match_id": parseInt(sendreq.match_id) }
                //{ "match_id": matchId }famt
            },
            {
                $lookup:
                {
                    from: plyrfantpoints,
                    localField: "pid",
                    foreignField: "pid",
                    as: "plyrfantpoint",
                    pipeline: [
                        {

                            $match: { "match_id": parseInt(sendreq.match_id) }
                            //{ "match_id": matchId, gamekey: "plyacc", gametype: gametype }
                        }]

                }
            },
            {

                $unwind: {
                    "path": "$plyrfantpoint",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                $lookup:
                {
                    from: "join_acc_players",
                    localField: "pid",
                    foreignField: "pid",
                    as: "joinaccply",
                    pipeline: [
                        {

                            $match: //{ "match_id": parseInt(sendreq.match_id), "gamekey": "plyacc", "gametype": "ckt", "userid": 178 }
                                { "match_id": parseInt(sendreq.match_id), "gamekey": "plyacc", "gametype": gametype }

                        }]

                }
            },
            {

                $unwind: {
                    "path": "$joinaccply",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                $match: { "$or": [{ "plyrfantpoint": { "$ne": null } }, { "joinaccply": { "$ne": null } }] }
            },
            

            {
                // $project: {
                //     jpoolid: "$joinaccply._id",
                //     userid: "$joinaccply.userid", match_id: "$joinaccply.match_id",
                //     sharecnt: "$joinaccply.sharecnt",
                //     pid: "$pid",
                //     playerdata: "$$ROOT",

                //     "totalpnt": "$plyrfantpoint.tp"
                // }
                $group: {
                    _id: { "pid": "$pid" },
                    jpoolid: { $first: "$joinaccply._id" },
                    match_id: { $first: "$joinaccply.match_id" },
                    sharecnt: { "$sum": "$joinaccply.sharecnt" },
                    winamt: { "$sum": "$joinaccply.winamt" },
                    pid: { $first: "$pid" },
                    //playerdata: { $first: "$$ROOT" },
                    //playerdata: { $first: "playerdata" },

                    "totalpnt": { $first: "$plyrfantpoint.tp" }
                }
            },
            {
                $lookup:
                {
                    from: "ckt_player_details",
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
                $lookup:
                {
                    from: plymetadatas,
                    localField: "pid",
                    foreignField: "pid",
                    as: "playermeta",

                }
            },
            {
                $unwind: {
                    "path": "$playermeta",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                $project: {
                    jpoolid: 1,
                    match_id: 1,
                    sharecnt: 1,
                    winamt: { "$round": ["$winamt", 2] },
                    pid: 1,
                    playerdata: 1,
                    "totalpnt": 1
                }
            },
            { "$sort": { "totalpnt": -1 } }

        ])

    } else {

        playersFantasy = await playersSchema.aggregate([
            {
                $match: { "match_id": parseInt(sendreq.match_id) }
            },
            {
                $lookup:
                {
                    from: "fb_player_details",
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
                $lookup:
                {
                    from: "fb_player_fantasy_points",
                    localField: "pid",
                    foreignField: "pid",
                    as: "plyrfantpoint",
                    pipeline: [
                        {
                            $match: { "match_id": parseInt(sendreq.match_id) }
                        }]

                }
            },
            {

                $unwind: {
                    "path": "$plyrfantpoint",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                $lookup:
                {
                    from: "fb_players_meta_data",
                    localField: "pid",
                    foreignField: "pid",
                    as: "plymeta",
                }
            },
            {

                $unwind: {
                    "path": "$plymeta",
                    "preserveNullAndEmptyArrays": true
                }
            },


            {
                $project: {
                    match_id: 1,
                    pid: 1,
                    plymeta:1,
                    playerdata: 1,
                    "totalpnt": { $cond: { if: { $gt: ["$plyrfantpoint.tp", 0] }, then: "$plyrfantpoint.tp", else: 0 } }
                }
            },
            { "$sort": { "totalpnt": -1 } }

        ]);
    }

    
    if (sendreq.type == "cricket") {
        
    //     playersFantasy = await Promise.all(playersFantasy.map(async (item) => {
    // //         let playerLogo = await CktPlayerMetaDataSchema.findOne({ pid: item.pid, });
    //         //item.playerdata.title = item.playerdata.display_name;
    //         if (item.playermeta) {
    //             item.playerdata.logo_url = `${env.awsimgurl}profile_doc/${item.playermeta.logo_url}`;
                
    //              //= `${env.awsimgurl}profile_doc/${item.playermeta.logo_url}`
    //         }   
    //         return item; 
    //      }))
         
    }
    // console.log("playerdataleaderboard",playersFantasy);
    let totalUserShareAmt = 0;
    let Total_Winnings = 0;
    let total_profit = 0;

    let joinAccList=await sjoinedGameSchema.find({ "match_id": parseInt(sendreq.match_id) }).lean();
    let jnPidshare={};
    let jnPidWin={};
    for (const itemJn of joinAccList) {
        jnPidshare[itemJn.pid]=(jnPidshare[itemJn.pid] || 0)+(itemJn.sharecnt || 0);
        jnPidWin[itemJn.pid]=itemJn.winamt;
    }

    playersFantasy.map(itemPly=>{
        itemPly["sharecnt"]=jnPidshare[itemPly.pid] || 0;
        itemPly["winamt"]=jnPidWin?.[itemPly.pid]?.toFixed(2) || 0;
        itemPly["playerdata"]["playing_role"]=itemPly["playerdata"]["position_id"];
        return itemPly;
    })

    
    // playersFantasy.forEach((itemTotalShare) => {
    //     if (itemTotalShare["sharecnt"]) {
    //         totalUserShareAmt = totalUserShareAmt + (itemTotalShare["sharecnt"] * gameaccs.prize);
    //     }
    // })

    let rankArray = [];
    // populating the rank array with the marks
    // for (let i = 0; i < playersFantasy.length; i++) {
    //     rankArray[i] = playersFantasy[i]['totalpnt'];
    // }
    
    // passing the rank array and the playersFantasyset to the giveRank() function
    let rankList = await giveRankAll(rankArray, playersFantasy, gameaccs.prize, totalUserShareAmt, sjoinedGameSchema, sendreq);
    
    let rankListNew = [];
    let totalShare = 0;
    rankList.resultArgNew.forEach(item => {
        //if (item.jpoolid) {
        totalShare = totalShare + item["sharecnt"];
        Total_Winnings = Total_Winnings + ((item["famt"]) ? item["famt"] : 0);
        rankListNew.push(item);
        //}
    })

    totalUserShareAmt = totalShare * gameaccs.prize;
    total_profit = (Total_Winnings - totalUserShareAmt)

    // Total_Winnings: Total_Winnings,
    //     total_profit: total_profit


    sendResponse.playAccData = rankListNew;
    sendResponse.totalShare = rankList.totalShare;
    return sendResponse;
}

// function for giving rank
let giveRankAll = async (arrayArg, resultArg, amtRankPerUser, totalUserShareAmt, sjoinedGameSchema, sendreq) => {
    
    let unique = [...new Set(resultArg.map(item => item.totalpnt))];
    unique.sort(function (a, b) { return b - a });
    let resultArgNew = [];
    let cnt = 0;

    unique.forEach((itemPnt, index) => {
        let postData = resultArg.filter(x => x.totalpnt == itemPnt);

        postData.forEach((itemData) => {
            itemData["position"] = index + 1
            resultArgNew.push(itemData);

        })
    })


    let findTopFourUserShare = resultArgNew;//.filter(x => x.position <= 4);

    let shhh = 0;

    resultArgNew.forEach((itemSum) => {
        if (itemSum["sharecnt"]) {
            totalUserShareAmt = totalUserShareAmt + (itemSum["sharecnt"] * amtRankPerUser)
            shhh = shhh + itemSum["sharecnt"];
        }
    })

    let topFourUserShare = 0;
    findTopFourUserShare.forEach((itemTop4) => {
        if (itemTop4["sharecnt"]) {
            topFourUserShare = topFourUserShare + itemTop4["sharecnt"]
        }
    })



    let perUseAmtDistribute = (topFourUserShare) ? totalUserShareAmt / topFourUserShare : 0;
    let totalWinDistributeToUser = 0;
    resultArgNew.forEach((itemPerAmt) => {

        if (itemPerAmt["sharecnt"] && itemPerAmt["position"] <= 4) {
            if (sendreq.status == 1 || sendreq.status == 2) {
                itemPerAmt["famt"] = 0;
            }
            else {
                let winPerAmt = winPerc[itemPerAmt["position"]] * perUseAmtDistribute / 100;
                itemPerAmt["famt"] = (itemPerAmt && itemPerAmt["winamt"]) ? itemPerAmt["winamt"] : 0 //itemPerAmt["sharecnt"] * winPerAmt;
                totalWinDistributeToUser = totalWinDistributeToUser + itemPerAmt["famt"];

            }
        }
        //itemPerAmt["totalShareCnt"]=shhh;
    })

    return { resultArgNew, totalShare: shhh };

}


module.exports = { plyAccumulator, plyAllAccumulator }