const response = require("../../helper/response");
const { generateRandomString } = require("../../helper/randomidgenrate");
const { poolmasterdataFunction } = require("../model/contestmodel");
const { ObjectId } = require("mongodb");
const { dateTimeZone, dateTimeChange, keyGen, currentTimeZoneDate } = require("../../helper/common");
let sdb = require("../../models");
const { socketConnection, socket } = require("../../src/view_model/Socket");
const { connectWithCricketDb, connectWithFootballDb, connectWithVendorDb } = require("../../config/mongodb_connections");
const createUpcomingCricketModel = require("../../mongo_models_new/credexon_cricket/UpcomingCricketsSchema");
const createFbPlayersModel = require("../../mongo_models_new/credexon_football/FbPlayersSchema");
const createContestsModel = require("../../mongo_models_new/credexon_vendor/ContestsSchema");
const createContestSeriesModel = require("../../mongo_models_new/credexon_vendor/ContestSeriesSchema");
const createJoinAccPlayersModel = require("../../mongo_models_new/credexon_vendor/JoinAccPlayersSchema");
const createPoolModel = require("../../mongo_models_new/credexon_vendor/PoolSchema");
const createPoolMasterModel = require("../../mongo_models_new/credexon_vendor/PoolMasterSchema");
const createPoolPrizeBreakMastersModel = require("../../mongo_models_new/credexon_vendor/PoolPrizeBreakMastersSchema");
const createPoolPrizeBreaksModel = require("../../mongo_models_new/credexon_vendor/PoolPrizeBreaksSchema");
const createUpcomingCricketPublishModel = require("../../mongo_models_new/credexon_vendor/UpcomingCricketsSchema");

module.exports = {
  create_pool: async (req, res) => {
    try {
      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const PoolMasterSchema = createPoolMasterModel(vendorDbConnection);
      const PoolPrizeBreakMastersSchema = createPoolPrizeBreakMastersModel(vendorDbConnection);

      const params = req.body;

      if (params.poolData.joinfee != "" && params.poolData.maxteams != "" && params.poolData.maxteams != "totalwinamt") {
        let poolSave = await PoolMasterSchema.create(params.poolData);

        params.breakPrizeData.pool_prize_break_data.forEach(async (item) => {
          let poolprizebreak_id = generateRandomString(8);
          let createData = {
            poolmaster_id: ObjectId(poolSave._id),
            pmin: item.pmin,
            pmax: item.pmax,
            pamount: item.pamount,
            poolprizebreak_id: poolprizebreak_id,
          };
          await PoolPrizeBreakMastersSchema.create(createData);
        });

        return res.send(response({}, "Pool created successfully.!!!", true));
      } else {
        return res.send(response({}, "Please Fill All Field.!!!", false));
      }
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
  pool_calculation: async (req, res) => {
    try {
      let response_array = { status: false, data: {}, message: "Calculation Not Updated Successfully" };
      const params = req.body;

      return res.send(response_array);
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
  save_series_pool_date: async (req, res) => {
    try {
      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const ContestSeriesSchema = createContestSeriesModel(vendorDbConnection);

      const params = req.body;

      let sendData = {
        contest_id: ObjectId(params.contest_id),
        date_start: params.date_start,
        date_end: params.date_end,
        gtype: params.gtype,
        league_id: params.league_id,
        session_id: params.session_id,
        matchid_start: params.matchid_start,
        matchid_end: params.matchid_end,
        rstatus: 1,
        status: 0,
      };
      let poolSave = await ContestSeriesSchema.updateOne({ contest_id: sendData.contest_id }, sendData, {
        upsert: true,
      });

      return res.send(response({}, "Series Date Time Added successfully.!!!", true));
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
  create_pool_prize: async (req, res) => {
    try {
      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const PoolPrizeBreakMastersSchema = createPoolPrizeBreakMastersModel(vendorDbConnection);

      const params = req.body;

      for (let i = 0; i < params.pool_prize_break_data.length; i++) {
        let poolprizebreak_id = generateRandomString(8);
        let createData = {
          poolmaster_id: ObjectId(params.pool_prize_break_data[i].poolmaster_id),
          pmin: params.pool_prize_break_data[i].pmin,
          pmax: params.pool_prize_break_data[i].pmax,
          pamount: params.pool_prize_break_data[i].pamount,
          poolprizebreak_id: poolprizebreak_id,
        };
        await PoolPrizeBreakMastersSchema.create(createData);
      }

      return res.send(response({}, "Poolprize break point created successfully.!!!", true));
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },

  // match_cricket_pool_contest_list: async (req, res) => {
  //     try {
  //         const params = req.body;

  //         let limit = (req.query.page != undefined) ? parseInt(req.query.limit) : 4;
  //         let page = (req.query.page != undefined) ? parseInt(req.query.page) : 0;
  //         let skip = page * limit;
  //         let where = {
  //             match_id: parseInt(params.match_id)
  //         }

  //         let wherepool = {
  //             contest_id : params.contest_id,
  //             gtype : params.gtype,
  //             type : params.type
  //         }
  //         let findData = await cricketplayerSchmea.find(where, { teama: 1, teamb: 1 })
  //         let totalCount = await Poolmaster(req.user.apikey).count({contest_id : ObjectId(params.contest_id)})

  //         let masterPoolData = await Poolmaster(req.user.apikey).find(wherepool)

  //         letSendTeamData = {

  //         }
  //         let newValueData = findData.map((item) => {

  //             letSendTeamData = {

  //                 teama: item?.teama?.team?.title,
  //                 teamalogo: item?.teama?.team?.thumb_url,
  //                 teamb: item?.teamb?.team?.title,
  //                 teamblogo: item?.teamb?.team?.thumb_url,
  //             }
  //         })

  //        let sendResponse =  {
  //             contestData:masterPoolData,
  //             matchDetail: letSendTeamData,
  //             totalCount: totalCount

  //         }

  //         let filterdata = []
  //         if(params.type){
  //             filterdata.push({ type: params.type})

  //         }

  //         if(params.countrytype){
  //             filterdata.push({ countrytype: params.countrytype})
  //         }

  //         // if(params.contest_id){
  //         //     filterdata.push({ _id: params.contest_id})
  //         // }

  //     //   await  contestsSchema(req.user.apikey).aggregate([
  //     //         {

  //     //                 $lookup:
  //     //                 {
  //     //                     from: "pool",
  //     //                     localField: "_id",
  //     //                     foreignField: "contest_id",
  //     //                     as: "poollist",
  //     //                     pipeline: [
  //     //              { $match: { $and:filterdata} },

  //     //                         {
  //     //                             $lookup:
  //     //                             {
  //     //                                 from: "poolprizebreaks",
  //     //                                 localField: "_id",
  //     //                                 foreignField: "pool_id",
  //     //                                 as: "poolpb",
  //     //                             },

  //     //                         },

  //     //                     ],

  //     //                 },
  //     //         },
  //     //         {
  //     //             $project: {
  //     //                 dis_val: 1,
  //     //                 status: 1,
  //     //                 title: 1,
  //     //                 subtitle: 1,
  //     //                 favcontest: 1,
  //     //                 isprivate: 1,
  //     //                 teama: 1,
  //     //                 "poollist.uptojoin": 1,
  //     //                 "poollist.joineduser": 1,
  //     //                 "poollist.joinfee": 1,
  //     //                 "poollist.totalwinamt": 1,
  //     //                 "poollist.winners": 1,
  //     //                 "poollist.maxteams": 1,
  //     //                 "poollist.match_id": 1,
  //     //                 "poollist._id": 1,
  //     //                 "poollist.status": 1,
  //     //                 "poollist.type": 1,
  //     //                 "poollist.ispoolfull": 1,
  //     //                 "poollist.iscancel": 1,
  //     //                 "poollist.gtype": 1,
  //     //                 "poollist.c": 1,
  //     //                 "poollist.m": 1,
  //     //                 "poollist.s": 1,
  //     //                 "poollist.poolpb.pmin": 1,
  //     //                 "poollist.poolpb.pmax": 1,
  //     //                 "poollist.poolpb.pamount": 1,
  //     //                 "poollist.poolpb._id": 1
  //     //             }
  //     //         },

  //     //         {
  //     //             $facet: {
  //     //                 data: [{ $skip: page }, { $limit: limit }],
  //     //             }
  //     //         }
  //     // //     ]).then((result) => {

  //     //         sendResponse.contestData = result

  //     //     }).catch((e) => {
  //     //         return res.send(response({}, "Something went wrong.!!!",false))

  //     //         // return resolve(e);
  //     //     })
  //         return res.send(response( sendResponse,"Data found succesfully.!!!", true))

  //     } catch (error) {

  //         return res.send(response({}, "Something went wrong.!!!",false))
  //         next(error)
  //     }
  // },

  match_cricket_pool_contest_list: async (req, res) => {
    try {
      const params = req.body;
      params.match_id = parseInt(params.match_id);

      const page = parseInt(req.query.page || 1);
      const limit = parseInt(req.query.limit || 10);
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const ContestsSchema = createContestsModel(vendorDbConnection);

      let currentDate = currentTimeZoneDate();

      let contestCondi = {
        status: 1,
      };

      let poolCondi = {
        type: params.type,
        gtype: params.gtype,
        status: 1,
      };
      if (params.contest_id) {
        contestCondi._id = ObjectId(params.contest_id);
      }
      if (params.countrytype) {
        poolCondi.countrytype = params.countrytype;
      }

      let queryDef = [];
      if (params.iscontest === 1) {
        queryDef.push({ $match: contestCondi });
        if (poolCondi.type == "s") {
          queryDef.push({
            $lookup: {
              from: "contest_series",
              localField: "_id",
              foreignField: "contest_id",
              as: "contestdata",
              pipeline: [
                {
                  $match: {
                    league_id: params.match_id,
                  },
                },
              ],
            },
          });
          queryDef.push({
            $unwind: {
              path: "$contestdata",
              preserveNullAndEmptyArrays: true,
            },
          });
        }

        queryDef.push({
          "$match":{"$or":[{"contestdata.date_end":{"$gt":currentDate}},{"contestdata.date_end":null}]}
        })
        

        queryDef.push({
          $project: {
            dis_val: 1,
            status: 1,
            title: 1,
            subtitle: 1,
            favcontest: 1,
            isprivate: 1,
            teama: 1,
            contestdata: "$contestdata",
          },
        });
        queryDef.push({ $skip: startIndex });
        queryDef.push({ $limit: endIndex });
      } else {
        queryDef.push({ $match: contestCondi });
        if (poolCondi.type == "s") {
          queryDef.push({
            $lookup: {
              from: "contest_series",
              localField: "_id",
              foreignField: "contest_id",
              as: "contestdata",
              pipeline: [
                {
                  $match: {
                    league_id: params.match_id,
                  },
                },
              ],
            },
          });
          queryDef.push({
            $unwind: {
              path: "$contestdata",
              preserveNullAndEmptyArrays: true,
            },
          });

          queryDef.push({
            "$match":{"contestdata.date_end":{"$gt":currentDate}}
          })
        }
        

        queryDef.push({
          $lookup: {
            from: "pool_masters",
            localField: "_id",
            foreignField: "contest_id",
            as: "poollist",
            pipeline: [{ $match: poolCondi }],
          },
        });
        queryDef.push({ $unwind: "$poollist" });

        queryDef.push({
          $project: {
            dis_val: 1,
            status: 1,
            title: 1,
            subtitle: 1,
            favcontest: 1,
            isprivate: 1,
            teama: 1,
            uptojoin: "$poollist.uptojoin",
            joineduser: "$poollist.joineduser",
            joinfee: "$poollist.joinfee",
            totalwinamt: "$poollist.totalwinamt",
            winners: "$poollist.winners",
            maxteams: "$poollist.maxteams",
            match_id: "$poollist.match_id",
            poolid: "$poollist._id",
            status: "$poollist.status",
            type: "$poollist.type",
            isChecked: "$poollist.isChecked",
            ispoolfull: "$poollist.ispoolfull",
            countrytype: "$poollist.countrytype",
            iscancel: "$poollist.iscancel",
            gtype: "$poollist.gtype",
            c: "$poollist.c",
            m: "$poollist.m",
            s: "$poollist.s",
            pmin: "$poollist.poolpb.pmin",
            pmax: "$poollist.poolpb.pmax",
            pamount: "$poollist.poolpb.joineduser",
            poolpbid: "$poollist.poolpb._id",
            contestdata: "$contestdata",
          },
        });
        queryDef.push({ $skip: startIndex });
        queryDef.push({ $limit: endIndex });
      }

      let dataCount = await ContestsSchema.countDocuments(contestCondi);
      await ContestsSchema.aggregate(queryDef)
        .then((result) => {
          //let dataCount = (result && result[0] && result[0].total_count && result[0].total_count[0] && result[0].total_count[0]["count"]) ? result[0].total_count[0]["count"] : 0;
          let dataList = result;

          /////////////////
          let liveEmitData = {
            match_id: params.match_id,
            type: "m",
            fetch_latest: 1,
            authorization: req.headers.authorization,
            auth: 1,
            cronapikey: req.user.apikey,
            userid: req.user.id,
          };
          let sktUrl = params.gtype == "ckt" ? "match_cricket_pool_contest_list_v2" : "match_football_pool_contest_list_v2";
          socketConnection();
          socket.emit(sktUrl, liveEmitData);
          /////////////////
          return res.send(
            response(
              {
                contestData: dataList,
                total_count: dataCount,
              },
              "Data found succesfully.!!!",
              true
            )
          );
        })
        .catch((e) => {
          return res.status(400).send(response({}, "Something went wrong.!!!", false));
        });
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },

  match_cricket_active_pool_contest_status_list: async (req, res) => {
    try {
      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);

      const { typeData, match_id, type, gtype } = req.body;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      if (typeData == "Contest") {
        const PoolSchema = createPoolModel(vendorDbConnection);

        const poolFilter = { match_id: parseInt(match_id), type, gtype, isChecked: 1 };
        // if (contest_id) poolFilter["contest_id"] = ObjectId(contest_id);
        // if (countrytype) poolFilter["countrytype"] = countrytype;

        const contestResults = await PoolSchema.aggregate([
          { $match: poolFilter },
          {
            $lookup: {
              from: "contests",
              localField: "contest_id",
              foreignField: "_id",
              as: "cont",
            },
          },
          { $unwind: { path: "$cont", preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: "join_match_contests",
              localField: "_id",
              foreignField: "poolid",
              as: "joinmc",
            },
          },
          { $unwind: { path: "$joinmc", preserveNullAndEmptyArrays: true } },
          {
            $group: {
              _id: { _id: "$_id" },
              winsum: { $sum: "$joinmc.winamt" },
              joineduser: { $first: "$joineduser" },
              joinfee: { $first: "$joinfee" },
              cont_title: { $first: "$cont.title" },
              cont_subtitle: { $first: "$cont.subtitle" },
              // totalamtjoiniii: { "$multiply": ["$joineduser", "$joinfee"] }
            },
          },
          {
            $facet: {
              data: [{ $skip: skip }, { $limit: limit }],
              total_count: [{ $count: "count" }],
            },
          },
        ]);

        const dataCount = contestResults[0].total_count[0]?.count || 0;
        const dataList = contestResults[0].data || [];

        return res.send(response({ contestData: dataList, total_count: dataCount }, "Data found successfully!", true));
      } else {
        const JoinAccPlayersSchema = createJoinAccPlayersModel(vendorDbConnection);

        const playerResults = await JoinAccPlayersSchema.aggregate([
          {
            $match: { match_id: parseInt(match_id) },
          },
          {
            $project: {
              pltfeeamt: { $multiply: ["$platformfee", "$gkamount", "$sharecnt", 0.01] },
              userid: 1,
              sharecnt: 1,
              winamt: 1,
              gkamount: 1,
              platformfee_percentage: "$platformfee",
            },
          },
          {
            $group: {
              _id: { userid: "$userid" },
              shrsum: { $sum: "$sharecnt" },
              wincnt: { $sum: { $cond: [{ $gt: ["$winamt", 0] }, 1, 0] } },
              twinamt: { $sum: "$winamt" },
              tgkamount: { $sum: "$gkamount" },
              tplatformfee: { $sum: "$platformfee_percentage" },
              pltfeeamt: { $sum: "$pltfeeamt" },
              userid: { $first: "$userid" },
            },
          },
          {
            $group: {
              _id: null,
              rshrsum: { $sum: "$shrsum" },
              wincnt: { $sum: "$wincnt" },
              winamt: { $sum: "$twinamt" },
              rtgkamount: { $sum: "$tgkamount" },
              usersum: { $sum: 1 },
              pltfeeamt: { $sum: "$pltfeeamt" },
            },
          },
          {
            $facet: {
              data: [{ $skip: skip }, { $limit: limit }],
              total_count: [{ $count: "count" }],
            },
          },
        ]);

        const dataList = playerResults[0].data || [];
        const dataCount = playerResults[0].total_count[0]?.count || 0;

        return res.send(response({ contestData: dataList, total_count: dataCount }, "Data found succesfully.!!!", true));
      }
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },

  match_cricket_all_active_pool_contest_status_list: async (req, res) => {
    try {
      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const JoinAccPlayersSchema = createJoinAccPlayersModel(vendorDbConnection);
      const PoolSchema = createPoolModel(vendorDbConnection);
      const UpcomingCktPubSchema = createUpcomingCricketPublishModel(vendorDbConnection);

      const { typeData, sdate, edate, type, gtype } = req.body;
      const { page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const date_start_ist = sdate && edate ? { $gte: dateTimeChange(sdate), $lte: dateTimeChange(edate) } : null;

      let match_list = await UpcomingCktPubSchema.find({
        is_active: 1,
        is_publish: 1,
        ...(date_start_ist && { date_start_ist }),
      })
        .sort({ date_start_ist: -1 })
        .skip(skip)
        .limit(5) //Todo: Why we have 5 limit as default value
        .lean();

      let matchIds = match_list.map(({ match_id }) => match_id);

      if (typeData == "Contest") {
        const poolCondition = {
          match_id: { $in: matchIds },
          type,
          gtype,
          isChecked: 1,
        };

        const contestResults = await PoolSchema.aggregate([
          { $match: poolCondition },
          {
            $lookup: {
              from: "contests",
              localField: "contest_id",
              foreignField: "_id",
              as: "cont",
            },
          },
          { $unwind: { path: "$cont", preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: "join_match_contests",
              localField: "_id",
              foreignField: "poolid",
              as: "joinmc",
            },
          },
          { $unwind: { path: "$joinmc", preserveNullAndEmptyArrays: true } },
          {
            $group: {
              _id: { _id: "$_id" },
              winsum: { $sum: "$joinmc.winamt" },
              joineduser: { $first: "$joineduser" },
              joinfee: { $first: "$joinfee" },
              cont_title: { $first: "$cont.title" },
              cont_subtitle: { $first: "$cont.subtitle" },
              // totalamtjoiniii: { "$multiply": ["$joineduser", "$joinfee"] }
            },
          },
          {
            $facet: {
              data: [{ $skip: skip }, { $limit: parseInt(limit) }],
              total_count: [{ $count: "count" }],
            },
          },
        ]);

        const dataCount = contestResults?.[0]?.total_count?.[0]?.count || 0;
        const dataList = contestResults?.[0]?.data || [];

        return res.send(response({ contestData: dataList, total_count: dataCount }, "Data found succesfully.!!!", true));
      } else {
        const playerResults = await JoinAccPlayersSchema.aggregate([
          { $match: { match_id: { $in: matchIds } } },
          {
            $project: {
              pltfeeamt: { $divide: [{ $multiply: ["$platformfee", "$gkamount", "$sharecnt"] }, 100] },
              userid: 1,
              sharecnt: 1,
              winamt: 1,
              gkamount: 1,
              platformfee_percentage: "$platformfee",
              userid: 1,
            },
          },
          {
            $group: {
              _id: { userid: "$userid" },
              shrsum: { $sum: "$sharecnt" },
              wincnt: { $sum: { $cond: [{ $gt: ["$winamt", 0] }, 1, 0] } },
              twinamt: { $sum: "$winamt" },
              tgkamount: { $sum: "$gkamount" },
              tplatformfee: { $sum: "$platformfee_percentage" },
              pltfeeamt: { $sum: "$pltfeeamt" },
              userid: { $first: "$userid" },
            },
          },

          {
            $group: {
              _id: null,
              rshrsum: { $sum: "$shrsum" },
              wincnt: { $sum: "$wincnt" },
              winamt: { $sum: "$twinamt" },
              rtgkamount: { $sum: "$tgkamount" },
              usersum: { $sum: 1 },
              pltfeeamt: { $sum: "$pltfeeamt" },
            },
          },
          {
            $facet: {
              data: [{ $skip: skip }, { $limit: parseInt(limit) }],
              total_count: [{ $count: "count" }],
            },
          },
        ]);

        const dataCount = playerResults?.[0]?.total_count?.[0]?.count || 0;
        const dataList = playerResults?.[0]?.data || [];

        return res.send(response({ contestData: dataList, total_count: dataCount }, "Data found succesfully.!!!", true));
      }
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },

  active_contest_list: async (req, res) => {
    try {
      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const PoolSchema = createPoolModel(vendorDbConnection);

      const { match_id, type, gtype, countrytype } = req.body;

      const condi = {
        type,
        gtype,
        isChecked: 1,
        ...(type === "s" ? { league_id: match_id } : { match_id }),
        ...(countrytype && { countrytype }),
      };

      const result = await PoolSchema.find(condi, { poolmaster_id: 1 }).lean();

      const poolActive = Object.fromEntries(result.map((item) => [item.poolmaster_id, 1]));

      return res.send(response(poolActive, "Data found succesfully.!!!", true));
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },

  //Todo: We have 2 function with same name
  match_football_pool_contest_list: async (req, res) => {
    try {
      const footballDbConnection = await connectWithFootballDb();
      const FbPlayersSchema = createFbPlayersModel(footballDbConnection);

      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const PoolMasterSchema = createPoolMasterModel(vendorDbConnection);

      const params = req.body;

      let limit = req.query.page != undefined ? parseInt(req.query.limit) : 4;
      let page = req.query.page != undefined ? parseInt(req.query.page) : 0;
      let skip = page * limit;
      let where = {
        match_id: parseInt(params.match_id),
      };

      let wherepool = {
        contest_id: params.contest_id,
        gtype: params.gtype,
        type: params.type,
      };
      let findData = await FbPlayersSchema.find(where, { teama: "$poollist.joineduser", teamb: 1 });
      let totalCount = await PoolMasterSchema.count({ contest_id: ObjectId(params.contest_id) });

      let masterPoolData = await PoolMasterSchema.find(wherepool);

      letSendTeamData = {};
      let newValueData = findData.map((item) => {
        letSendTeamData = {
          teama_id: item?.teama?.team_id,
          teama: item?.teama?.team?.title,
          teamalogo: item?.teama?.team?.thumb_url,
          teamb_id: item?.teamb?.team_id,
          teamb: item?.teamb?.team?.title,
          teamblogo: item?.teamb?.team?.thumb_url,
        };
      });

      let sendResponse = {
        contestData: masterPoolData,
        matchDetail: letSendTeamData,
        totalCount: totalCount,
      };

      let filterdata = [];
      if (params.type) {
        filterdata.push({ type: params.type });
      }

      if (params.countrytype) {
        filterdata.push({ countrytype: params.countrytype });
      }

      // if(params.contest_id){
      //     filterdata.push({ _id: params.contest_id})
      // }

      //   await  contestsSchema(req.user.apikey).aggregate([
      //         {

      //                 $lookup:
      //                 {
      //                     from: "pool",
      //                     localField: "_id",
      //                     foreignField: "contest_id",
      //                     as: "poollist",
      //                     pipeline: [
      //              { $match: { $and:filterdata} },

      //                         {
      //                             $lookup:
      //                             {
      //                                 from: "poolprizebreaks",
      //                                 localField: "_id",
      //                                 foreignField: "pool_id",
      //                                 as: "poolpb",
      //                             },

      //                         },

      //                     ],

      //                 },
      //         },
      //         {
      //             $project: {
      //                 dis_val: 1,
      //                 status: 1,
      //                 title: 1,
      //                 subtitle: 1,
      //                 favcontest: 1,
      //                 isprivate: 1,
      //                 teama: 1,
      //                 "poollist.uptojoin": 1,
      //                 "poollist.joineduser": 1,
      //                 "poollist.joinfee": 1,
      //                 "poollist.totalwinamt": 1,
      //                 "poollist.winners": 1,
      //                 "poollist.maxteams": 1,
      //                 "poollist.match_id": 1,
      //                 "poollist._id": 1,
      //                 "poollist.status": 1,
      //                 "poollist.type": 1,
      //                 "poollist.ispoolfull": 1,
      //                 "poollist.iscancel": 1,
      //                 "poollist.gtype": 1,
      //                 "poollist.c": 1,
      //                 "poollist.m": 1,
      //                 "poollist.s": 1,
      //                 "poollist.poolpb.pmin": 1,
      //                 "poollist.poolpb.pmax": 1,
      //                 "poollist.poolpb.pamount": 1,
      //                 "poollist.poolpb._id": 1
      //             }
      //         },

      //         {
      //             $facet: {
      //                 data: [{ $skip: page }, { $limit: limit }],
      //             }
      //         }
      //     ]).then((result) => {

      //         sendResponse.contestData = result

      //     }).catch((e) => {
      //         return res.send(response({}, "Something went wrong.!!!",false))

      //         // return resolve(e);
      //     })
      return res.send(response(sendResponse, "Data found succesfully.!!!", true));
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },

  // match_football_pool_contest_list: async (req, res) => {
  //     try {
  //         const params = req.body;
  //         let limit = (req.query.page != undefined) ? parseInt(req.query.limit) : 4;
  //         let page = (req.query.page != undefined) ? parseInt(req.query.page) : 0;
  //         let skip = page * limit;
  //         let where = {
  //             match_id: parseInt(params.match_id)
  //         }
  //         let findData = await footballPlayersSchema.find(where, { teama: 1, teamb: 1 })

  //         let totalCount = await contestsSchema(req.user.apikey).count()
  //         letSendTeamData = {

  //         }
  //         let newValueData = findData.map((item) => {

  //             letSendTeamData = {

  //                 teama: item.teama.team.title,
  //                 teamalogo: item.teama.team.logo_url,
  //                 teamb: item.teamb.team.title,
  //                 teamblogo: item.teamb.team.logo_url,
  //             }
  //         })

  //        let sendResponse =  {
  //             contestData: "",
  //             matchDetail: letSendTeamData,
  //             totalCount: totalCount

  //         }
  //       await  contestsSchema(req.user.apikey).aggregate([
  //             {
  //                 $lookup:
  //                 {
  //                     from: "pool",
  //                     localField: "_id",
  //                     foreignField: "contest_id",
  //                     as: "poollist",
  //                     pipeline: [
  //                         // {
  //                         //     $match: {
  //                         //         $expr: {
  //                         //             $and: [
  //                         //                 { $eq: ['$match_id', parseInt(params.match_id)] },
  //                         //             ]
  //                         //         }
  //                         //     }
  //                         // },
  //                         {
  //                             $lookup:
  //                             {
  //                                 from: "poolprizebreaks",
  //                                 localField: "_id",
  //                                 foreignField: "pool_id",
  //                                 as: "poolpb",
  //                             },

  //                         },

  //                     ]
  //                 },
  //             },
  //             {
  //                 $project: {
  //                     dis_val: 1,
  //                     status: 1,
  //                     title: 1,
  //                     subtitle: 1,
  //                     favcontest: 1,
  //                     isprivate: 1,
  //                     teama: 1,
  //                     "poollist.uptojoin": 1,
  //                     "poollist.joineduser": 1,
  //                     "poollist.joinfee": 1,
  //                     "poollist.totalwinamt": 1,
  //                     "poollist.winners": 1,
  //                     "poollist.maxteams": 1,
  //                     "poollist.match_id": 1,
  //                     "poollist._id": 1,
  //                     "poollist.status": 1,
  //                     "poollist.type": 1,
  //                     "poollist.ispoolfull": 1,
  //                     "poollist.iscancel": 1,
  //                     "poollist.gtype": 1,
  //                     "poollist.c": 1,
  //                     "poollist.m": 1,
  //                     "poollist.s": 1,
  //                     "poollist.poolpb.pmin": 1,
  //                     "poollist.poolpb.pmax": 1,
  //                     "poollist.poolpb.pamount": 1,
  //                     "poollist.poolpb._id": 1
  //                 }
  //             },

  //             {
  //                 $facet: {
  //                     data: [{ $skip: page }, { $limit: limit }],
  //                 }
  //             }
  //         ]).then((result) => {

  //             sendResponse.contestData = result

  //         }).catch((e) => {
  //             return res.send(response({}, "Something went wrong.!!!",false))

  //             // return resolve(e);
  //         })
  //         return res.send(response( sendResponse,"Data found succesfully.!!!", true))

  //     } catch (error) {
  //         return res.send(response({}, "Something went wrong.!!!",false))
  //         next(error)
  //     }
  // },
  match_football_pool_contest_list: async (req, res) => {
    try {
      const footballDbConnection = await connectWithFootballDb();
      const FbPlayersSchema = createFbPlayersModel(footballDbConnection);

      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const PoolMasterSchema = createPoolMasterModel(vendorDbConnection);

      const params = req.body;

      let limit = req.query.page != undefined ? parseInt(req.query.limit) : 4;
      let page = req.query.page != undefined ? parseInt(req.query.page) : 0;
      let skip = page * limit;
      let where = {
        match_id: parseInt(params.match_id),
      };
      let wherepool = {
        contest_id: params.contest_id,
        gtype: params.gtype,
        type: params.type,
      };
      let findData = await FbPlayersSchema.find(where, { teama: 1, teamb: 1 });
      let totalCount = await PoolMasterSchema.count({ contest_id: ObjectId(params.contest_id) });
      let masterPoolData = await PoolMasterSchema.find(wherepool);

      letSendTeamData = {};
      let newValueData = findData.map((item) => {
        letSendTeamData = {
          teama_id: item?.teama?.team_id,
          teamb_id: item?.teamb?.team_id,
          teama: item?.teama?.team?.title,
          teamalogo: item?.teama?.team?.thumb_url,
          teamb: item?.teamb?.team?.title,
          teamblogo: item?.teamb?.team?.thumb_url,
        };
      });
      let sendResponse = {
        contestData: masterPoolData,
        matchDetail: letSendTeamData,
        totalCount: totalCount,
      };
      let filterdata = [];
      if (params.type) {
        filterdata.push({ type: params.type });
      }
      if (params.countrytype) {
        filterdata.push({ countrytype: params.countrytype });
      }
      // if(params.contest_id){
      //     filterdata.push({ _id: params.contest_id})
      // }
      //   await  contestsSchema(req.user.apikey).aggregate([
      //         {
      //                 $lookup:
      //                 {
      //                     from: "pool",
      //                     localField: "_id",
      //                     foreignField: "contest_id",
      //                     as: "poollist",
      //                     pipeline: [
      //              { $match: { $and:filterdata} },
      //                         {
      //                             $lookup:
      //                             {
      //                                 from: "poolprizebreaks",
      //                                 localField: "_id",
      //                                 foreignField: "pool_id",
      //                                 as: "poolpb",
      //                             },
      //                         },
      //                     ],
      //                 },
      //         },
      //         {
      //             $project: {
      //                 dis_val: 1,
      //                 status: 1,
      //                 title: 1,
      //                 subtitle: 1,
      //                 favcontest: 1,
      //                 isprivate: 1,
      //                 teama: 1,
      //                 "poollist.uptojoin": 1,
      //                 "poollist.joineduser": 1,
      //                 "poollist.joinfee": 1,
      //                 "poollist.totalwinamt": 1,
      //                 "poollist.winners": 1,
      //                 "poollist.maxteams": 1,
      //                 "poollist.match_id": 1,
      //                 "poollist._id": 1,
      //                 "poollist.status": 1,
      //                 "poollist.type": 1,
      //                 "poollist.ispoolfull": 1,
      //                 "poollist.iscancel": 1,
      //                 "poollist.gtype": 1,
      //                 "poollist.c": 1,
      //                 "poollist.m": 1,
      //                 "poollist.s": 1,
      //                 "poollist.poolpb.pmin": 1,
      //                 "poollist.poolpb.pmax": 1,
      //                 "poollist.poolpb.pamount": 1,
      //                 "poollist.poolpb._id": 1
      //             }
      //         },
      //         {
      //             $facet: {
      //                 data: [{ $skip: page }, { $limit: limit }],
      //             }
      //         }
      //     ]).then((result) => {
      //         sendResponse.contestData = result
      //     }).catch((e) => {
      //         return res.send(response({}, "Something went wrong.!!!",false))
      //         // return resolve(e);
      //     })
      return res.send(response(sendResponse, "Data found succesfully.!!!", true));
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },

  edit_pool_prize: async (req, res) => {
    try {
      const params = req.body;

      for (let i = 0; i < params.pool_prize_break_data.length; i++) {
        let createData = {
          // poolmaster_id : params.pool_prize_break_data[i].poolmaster_id,
          pmin: params.pool_prize_break_data[i].pmin,
          pmax: params.pool_prize_break_data[i].pmax,
          pamount: params.pool_prize_break_data[i].pamount,
        };

        let where = {
          poolprizebreak_id: params.pool_prize_break_data[i].poolprizebreak_id,
        };

        await Poolprizebreak.updateOne(where, { $set: createData }).then((result) => {
          if (result.nModified == 1) {
            return res.send(response({}, "Poolprize break point Update successfully.!!!", true));
          }
          if (result.nModified == 0) {
            return res.send(response({}, "Poolprize break point Not Update.!!!", true));
          }
        });
      }
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },

  active_inactive_pool: async (req, res) => {
    try {
      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const PoolMasterSchema = createPoolMasterModel(vendorDbConnection);

      const params = req.body;
      let where = {
        _id: ObjectId(params.poolmaster_id),
      };
      let createData = {
        status: params.status,
      };

      try {
        await PoolMasterSchema.updateOne(where, { $set: createData }).then((result, error) => {
          if (result.nModified == 1) {
            if (params.status == 1) {
              return res.send(response({}, "Pool Active successfully.!!!.!!!", true));
            }
            if (params.status == 0) {
              return res.send(response({}, "Pool Deactivate successfully.!!!.!!!", true));
            }
            if (params.status == 2) {
              return res.send(response({}, "Pool Delete successfully.!!!.!!!", true));
            }
          }
          if (result.nModified == 0) {
            return res.send(response({}, "Poolmaster Not Update.!!!", true));
          }
        });
      } catch (error) {
        return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
      }
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },

  active_inactive_contest_pool_match: async (req, res) => {
    try {
      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const ContestSeriesSchema = createContestSeriesModel(vendorDbConnection);
      const PoolSchema = createPoolModel(vendorDbConnection);
      const PoolMasterSchema = createPoolMasterModel(vendorDbConnection);
      const PoolPrizeBreakMastersSchema = createPoolPrizeBreakMastersModel(vendorDbConnection);
      const PoolPrizeBreaksSchema = createPoolPrizeBreaksModel(vendorDbConnection);

      const params = req.body;

      let dataPool;
      let dataPoolPrize;

      try {
        dataPool = await PoolMasterSchema.findOne({ _id: ObjectId(params.poolmaster_id) });
        dataPoolPrize = await PoolPrizeBreakMastersSchema.find({
          poolmaster_id: ObjectId(params.poolmaster_id),
        });

        dataPool["poolmaster_id"] = dataPool["_id"];
        dataPool["match_id"] = parseInt(params.match_id);
        let contestSeriesChk = await ContestSeriesSchema.findOne({
          contest_id: ObjectId(dataPool.contest_id),
          league_id: dataPool["match_id"],
        });
        if (params.type == "s" && !contestSeriesChk) {
          return res.send(response({}, "Please select date first", false));
        }

        let keyName = params.type == "s" ? "league_id" : "match_id";
        let sendData = {
          joinfee: dataPool.joinfee,
          [keyName]: dataPool.match_id,
          totalwinamt: dataPool.totalwinamt,
          winners: dataPool.winners,
          maxteams: dataPool.maxteams,
          c: dataPool.c,
          m: dataPool.m,
          s: dataPool.s,
          status: dataPool.status,
          favpool: dataPool.favpool,
          isChecked: params.isChecked,
          contest_id: dataPool.contest_id,
          poolmaster_id: ObjectId(dataPool.poolmaster_id),
          createdAt: dataPool.createdAt,
          updatedAt: dataPool.updatedAt,
          type: dataPool.type,
          gtype: dataPool.gtype,
          countrytype: dataPool.countrytype,
          usable_bonus_percentage: dataPool.usable_bonus_percentage,
        };
        let poolId = null;

        // await Poolmaster(req.user.apikey).updateOne(
        //     { _id: ObjectId(params.poolmaster_id) }, { isChecked: parseInt(params.isChecked) });
        let dataPoolPool = await PoolSchema.findOne({
          [keyName]: dataPool.match_id,
          type: dataPool.type,
          gtype: dataPool.gtype,
          poolmaster_id: ObjectId(params.poolmaster_id),
          countrytype: dataPool.countrytype,
        });

        if (dataPoolPool) {
          await PoolSchema.updateOne({ _id: ObjectId(dataPoolPool._id) }, { $set: sendData });
        } else {
          let getData = await PoolSchema.create(sendData);
          poolId = getData._id;
        }
        if (dataPoolPrize && dataPoolPrize.length > 0) {
          dataPoolPrize.forEach(async (item) => {
            let sendData = {
              pool_id: poolId,
              ppbmaster_id: item.poolmaster_id,
              pmin: item.pmin,
              pmax: item.pmax,
              pamount: item.pamount,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            };
            await PoolPrizeBreaksSchema.create(sendData);
          });
        }

        let liveEmitData = {
          dbName: dbName,
          match_id: params.match_id,
          type: params.type,
          userid: req.user.id,
          fetch_latest: 1,
          auth: 1,
          authorization: req.headers.authorization,
        };
        let gtype = params.gtype == "ckt" ? "cricket" : "football";
        let sktUrl = `my_match_${gtype}_pool_contest_list_v2`;
        socketConnection();
        socket.emit(sktUrl, liveEmitData);

        return res.send(response(sendData, "Pool Update successfully.!!!", true));
      } catch (error) {
        return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
      }
      let matchid = {
        match_id: params.match_id,
      };
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },

  delete_pool_prize: async (req, res) => {
    try {
      const params = req.body;

      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const PoolPrizeBreakMastersSchema = createPoolPrizeBreakMastersModel(vendorDbConnection);

      let prize_break = await PoolPrizeBreakMastersSchema.findOne({
        poolprizebreak_id: params.poolprizebreak_id,
      });
      if (prize_break) {
        await Poolprizebreak.deleteOne(params);
        return res.send(response({}, "Poolprize break point delete successfully.!!!", true));
      }
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },

  // poolmaster_list: async (req, res) => {
  //     try {
  //         const page = parseInt(req.query.page || 1)
  //         const limit = parseInt(req.query.limit || 10);
  //         const startIndex = (page - 1) * limit;
  //         const endIndex = page * limit;

  //         let list = await Contests.find().skip(startIndex).limit(limit).lean().then(async (result) => {
  //             let poolmasterDatas = await Promise.all(result.map(item => poolmasterdataFunction(item)))
  //             // let poolmaste = await Promise.all(poolmasterDatas.map(item => poolmasterdataFunction(item)))

  //             let checked = true
  //             // if(checked){
  //             poolmasterDatas.map(async (item) => {

  //                 if (item?.poolmasterData?.isChecked == 1) {
  //                     let pool_id = await generateRandomString(8);
  //                     item.pool_id = pool_id

  //                     await poolSchema(req.user.apikey).create(item);

  //                 }
  //             })
  //             let total_count = await Contests.find({}).count()
  //             // }

  //             return res.send(response({
  //                 total_count: total_count,
  //                 poolmasterDatas: poolmasterDatas,
  //                 status: poolmasterDatas.length > 0 ? true : false,

  //             }, poolmasterDatas.length > 0 ? "Data found succesfully.!!!" : "No data found.!!!"))

  //             // return res.send(response({
  //             //     poolmasterDatas
  //             // }, "Data found succesfully."));
  //         })

  //     } catch (error) {
  //         next(error)
  //     }
  // },
  poolmaster_list: async (req, res) => {
    try {
      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const PoolMasterSchema = createPoolMasterModel(vendorDbConnection);

      const params = req.body;

      let limit = req.query.page != undefined ? parseInt(req.query.limit) : 10;
      let page = req.query.page != undefined ? parseInt(req.query.page) : 0;
      let skip = page * limit;

      let condition = {
        contest_id: ObjectId(params.contest_id),
        gtype: params.gtype,
        type: params.type,
        status: { $in: [0, 1] },
      };

      await PoolMasterSchema.aggregate([
        {
          $match: condition,
        },
        {
          $lookup: {
            from: "pool_prize_break_masters",
            localField: "_id",
            foreignField: "poolmaster_id",
            as: "poolpzbk",
            pipeline: [{ $sort: { _id: 1 } }],
          },
        },
        { $skip: skip },
        { $limit: limit },
      ]).then(async (result) => {
        let total_count = await PoolMasterSchema.countDocuments(condition);

        return res.send(
          response(
            {
              total_count: total_count,
              poolmasterlist: result,
              status: result.length > 0 ? true : false,
            },
            result.length > 0 ? "Data found succesfully.!!!" : "No data found.!!!"
          )
        );
      });
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },

  pool_list_view: async (req, res) => {
    try {
      const params = req.body;
      let list = await Contests.find({
        contest_id: params.contest_id,
      })
        .lean()
        .then(async (result) => {
          let poolmasterDatas = await Promise.all(result.map((item) => poolmasterdataFunction(item, req)));
        });
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
  pool_list_checked: async (req, res) => {
    try {
      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const PoolSchema = createPoolModel(vendorDbConnection);

      const params = req.body;
      let response_array = { status: false, data: {}, message: "Data is not Update" };
      let send_array = {};
      if (params.isChecked) {
        send_array.isChecked = params.isChecked;
      }
      await PoolSchema.updateOne({ _id: ObjectId(params.pool_id) }, { $set: params });

      response_array.status = true;
      if (params.isChecked == 1) {
        response_array.message = "Pool active Successfully!!!";
      } else if (params.isChecked == 0) {
        response_array.message = "pool deactivate Successfully!!!";
      }
      return res.send(response_array);
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
};

//helper function

// const poolmasterdataFunction = async (data) => {

//     return new Promise(async (resolve, reject) => {
//         try {
//             data.is_save = false;
//             let match = { contest_id: data.contest_id, };
//             await Poolmaster(req.user.apikey).find(match).then((result) => {

//                 // let mota = JSON.stringify(result)
//                 data.poolmasterData = result[0]

//                 resolve(data)
//             }).catch((err) => {
//                 resolve(err);
//             })

//         } catch (e) {

//         }
//     })
// }
