require('dotenv').config();
const { winPerc, keyGen } = require('../../helper/common');
const env = process.env;

const { connectWithGeneralDb, connectWithFootballDb, connectWithVendorDb, connectWithCricketDb } = require('../../config/mongodb_connections');
const createGameAccsModel = require('../../mongo_models_new/credexon_general/GameAccsSchema');
const createCktTeamFantasyPointsModel = require('../../mongo_models_new/credexon_cricket/CktTeamFantasyPointsSchema');
const createCktTeamMetaDataModel = require('../../mongo_models_new/credexon_cricket/CktTeamMetaDataSchema');
const createCktLeaguesModel = require('../../mongo_models_new/credexon_cricket/CktLeaguesSchema');
const createCktSeriesMetaDataModel = require('../../mongo_models_new/credexon_cricket/CktSeriesMetaDataSchema');
const createFbTeamFantasyPointsModel = require('../../mongo_models_new/credexon_football/FbTeamFantasyPointsSchema');
const createFbLeaguesModel = require('../../mongo_models_new/credexon_football/FbLeaguesSchema');
const createJoinAccTeamsModel = require('../../mongo_models_new/credexon_vendor/JoinAccTeamsSchema');
const createCktTeamsModel = require('../../mongo_models_new/credexon_cricket/CktTeamsSchema');
const createFbTeamsModel = require('../../mongo_models_new/credexon_football/FbTeamsSchema');

let tmAccumulator = async (sendreq) => {
    const generalDbConnection = await connectWithGeneralDb();
    const GameAccsSchema = createGameAccsModel(generalDbConnection);

    
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
    let teamDetail = null;

    //////////////////

    let teammetadatas = null;

    console.log("sendreq--->>", sendreq);
    //////////////////
    
    if (sendreq.type === "cricket") {
        const cktDbConnection = await connectWithCricketDb();
        const CktTeamMetaDataSchema = createCktTeamMetaDataModel(cktDbConnection);
        const CktSeriesMetaDataSchema = createCktSeriesMetaDataModel(cktDbConnection);
        const CktTeamFantasyPointsSchema = createCktTeamFantasyPointsModel(cktDbConnection);
        const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);
        const CktTeamsSchema=createCktTeamsModel(cktDbConnection);

        upcomingSchema = CktLeaguesSchema;
        upcomCondi = { "cid": parseInt(sendreq.league_id) };
        sjoinedGameSchema = JoinAccTeamsSchema;
        userplym = "user_players_series_ckts";
        teamDetail = CktTeamsSchema;
        seriesmetadatas = "ckt_series_meta_data";
        gametype = "ckt";
        fantasypnt = "ckt_team_fantasy_points";
        teammetadatas = CktTeamMetaDataSchema; // Todo: Not using
        teamfantpointsSchema = CktTeamFantasyPointsSchema;
    } else if (sendreq.type === "football") {
        const footballDbConnection = await connectWithFootballDb();
        const FbTeamFantasyPointsSchema = createFbTeamFantasyPointsModel(footballDbConnection);
        const FbLeaguesSchema = createFbLeaguesModel(footballDbConnection);
        const FbTeamsSchema=createFbTeamsModel(footballDbConnection);

        upcomingSchema = FbLeaguesSchema;
        upcomCondi = { "season_id": parseInt(sendreq.league_id) };
        sjoinedGameSchema = JoinAccTeamsSchema;
        userplym = "user_players_series_fbs";
        teamDetail =FbTeamsSchema;
        seriesmetadatas = "fb_series_meta_datas";
        gametype = "fb";
        fantasypnt = "fb_team_fantasy_points";
        teamfantpointsSchema = FbTeamFantasyPointsSchema;
    }


    let gameaccs = await GameAccsSchema.findOne({ gamekey: "tmacc" });
    let upcomingList = await upcomingSchema.findOne(upcomCondi);



    if (gameaccs && gameaccs.prize) {
        // upcomingList.forEach(async (item, indexUpc) => {
        let item = Object.assign({}, upcomingList)

        let joinCondi = { gamekey: "tmacc", gametype: gametype };
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
        
        ////////////////////////////
        let joinedTeam=await sjoinedGameSchema.aggregate([
            {
                $match: joinCondi
            },
            {
                $project: {
                    jpoolid: "$_id",
                    userid: 1,
                    league_id: 1,
                    sharecnt: 1,
                    team_id: 1,
                    
                }
            }
        ])
        
        let leagueName = sendreq.type === "football"
  ? { "$first": "$name" }
  : { "$first": "$title" };

let leagueLogo = sendreq.type === "football"
  ? { "$first": "$logo_path" }
  : { "$first": "$team.logo_url" };

let teamDetailing = await teamDetail.aggregate([
  {
    "$match": { [league_id_key]: league_id }
  },
  {
    "$lookup": {
      from: fantasypnt,
      localField: "team_id",
      foreignField: "team_id",
      as: "fantasypnt",
      pipeline: [
        {
          $match: tmfpCond
        }
      ]
    }
  },
  {
    "$unwind": {
      "path": "$fantasypnt",
      "preserveNullAndEmptyArrays": true
    }
  },
  {
    "$group": {
      _id: { "team_id": "$team_id" },
      team_id: { "$first": "$team_id" },
      totalpnt: { "$avg": "$fantasypnt.tp" },
      team_name: leagueName,
      team_logo: leagueLogo
    }
  }
  // { "$sort": { "totalpnt": -1 } }
]);
        
        let fbTIdPnt={};
        teamDetailing.forEach(item=>{
            fbTIdPnt[item.team_id]=item;
        })
        

        let teamFantasyData=[];
        joinedTeam.forEach(itemTm=>{
            itemTm["totalpnt"]=fbTIdPnt?.[itemTm.team_id]?.["totalpnt"] || 0;
            itemTm["team_name"]=fbTIdPnt?.[itemTm.team_id]?.["team_name"] || "";
            itemTm["team_logo"]=fbTIdPnt?.[itemTm.team_id]?.["team_logo"] || "";
            teamFantasyData.push(itemTm)
        })
        console.log("joinedTeam22--->>",JSON.stringify(teamFantasyData));
        ////////////////////////////

        /*
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

                            $match: joinCondi//{ league_id: 19699, gamekey: "tmacc", gametype: gametype }
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

                            $match: { season_id: league_id }//{ league_id: 19699, gamekey: "tmacc", gametype: gametype }
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
        */


        let totalUserShareAmt = 0;


        // playersFantasy.forEach((itemTotalShare) => {
        //     if (itemTotalShare["sharecnt"]) {
        //         totalUserShareAmt = totalUserShareAmt + (itemTotalShare["sharecnt"] * gameaccs.prize);
        //     }
        // })

        console.log("teamFantasyData---->>>",JSON.stringify(teamFantasyData));
        let totalShare = await sjoinedGameSchema.aggregate([{ $match: { "league_id": league_id } }, {
            $group:
                { _id: null, sum: { $sum: "$sharecnt" } }
        }])

        //console.log("totalShare--->>", totalShare && totalShare.length > 0 && totalShare[0]["sum"]);
        totalShare = totalShare && totalShare.length > 0 ? totalShare[0]["sum"] : 0

        let rankArray = [];
        //console.log("gameaccs-->>", gameaccs.prize);
        // passing the rank array and the teamFantasy to the giveRank() function
        let rankList = await giveRank(rankArray, teamFantasyData, gameaccs.prize, totalUserShareAmt, sjoinedGameSchema, upcomingSchema, league_id, totalShare, sendreq);


        console.log("rankListIs----->>", rankList)
        sendResponse.teamAccData = rankList;

        let where = upcomCondi;

        //let findData = await teamDetailSchema.findOne(where, { teama: 1, teamb: 1 }).lean();
        sendResponse.seriesDetail = await upcomingSchema.findOne(where, {
            date_end: 1, date_start: 1, _id: 1,
            abbr: 1, category: 1, cid: 1, logo_url: 1, name: 1
        });

        if(sendreq.type === "cricket"){
            let itemLogo = await teammetadatas.findOne({ league_id: league_id });
            if (sendResponse?.seriesDetail) {
                sendResponse.seriesDetail.logo_url = (itemLogo && itemLogo.logo_url) ? `${env.awsimgurl}profile_doc/${itemLogo.logo_url}` : "";
            }
        }
        console.log("league_idleague_idleague_id", league_id)
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


        let findTopFourUserShare = resultArgNew.filter(x => x.position <= 4);

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
            if (itemPerAmt["sharecnt"] && itemPerAmt["position"] <= 4) {
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




module.exports = { tmAccumulator };