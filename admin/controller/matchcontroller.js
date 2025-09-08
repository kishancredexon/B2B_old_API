const response = require("../../helper/response");
const { dateTimeZone, dateTimeChange, keyGen, currentTimeZoneDate } = require("../../helper/common");
let sdb = require("../../models");
const { socketConnection, socket } = require("../../src/view_model/Socket");
const { connectWithGeneralDb, connectWithCricketDb, connectWithFootballDb, connectWithMasterDb, connectWithVendorDb } = require("../../config/mongodb_connections");
const createFantasyPointsModel = require("../../mongo_models_new/credexon_general/FantasyPointsSchema");
const createCktLeaguesModel = require("../../mongo_models_new/credexon_cricket/CktLeaguesSchema");
const createUpcomingCricketModel = require("../../mongo_models_new/credexon_cricket/UpcomingCricketsSchema");
const createFbUpcomingsModel = require("../../mongo_models_new/credexon_football/FbUpcomingsSchema");
const createPoolModel = require("../../mongo_models_new/credexon_vendor/PoolSchema");
const createUpcomingCricketPublishModel = require("../../mongo_models_new/credexon_vendor/UpcomingCricketsSchema");
const createCktLeaguesPubModel = require("../../mongo_models_new/credexon_vendor/CktLeaguesPubSchema");
const createFbLeaguesPubModel = require("../../mongo_models_new/credexon_vendor/FbLeaguesPubSchema");
const createFbLeaguesSeasonsModel = require("../../mongo_models_new/credexon_football/FbLeagueSeasonsSchema");
const createMasterUsersModel = require("../../mongo_models_new/credexon_master/MasterUsersSchema");
const createUpcomingFootballPublishModel = require("../../mongo_models_new/credexon_vendor/UpcomingFootballSchema");
const axios = require("axios");

module.exports = {
  match_list: async (req, res) => {
    try {
      const cktDbConnection = await connectWithCricketDb();
      const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);

      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const UpcomingCktPubSchema = createUpcomingCricketPublishModel(vendorDbConnection);

      let upCkt = await UpcomingCktPubSchema.find({ rstatus: 1, is_active: 1 }, { match_id: 1 });

      let limit = req.query.page != undefined ? parseInt(req.query.limit) : 10;
      let page = req.query.page != undefined ? parseInt(req.query.page) : 0;
      let skip = page * limit;
      //limit and pagination

      let currentDate = currentTimeZoneDate();

      let match_list = await UpcomingCricketsSchema.find(
        {
          rstatus: 1,
          //is_players: 1,
          date_start_ist: { $gt: currentDate },
        },
        {
          cid: 1,
          match_id: 1,
          title: 1,
          subtitle: 1,
          date_start_ist: 1,
          rstatus:1
        }
      )
        .sort({ date_start_ist: 1 })
        .skip(skip)
        .limit(limit)
        .exec();

      //count
      let total_count = await UpcomingCricketsSchema.countDocuments({
        rstatus: 1,
        is_players: 1,
        date_start_ist: { $gt: currentDate },
      });

      let matchIdArr = [];
      if (upCkt?.length > 0) {
        for (let i = 0; i < upCkt?.length; i++) {
          matchIdArr.push(upCkt[i]["match_id"]);
        }
      }

      if (matchIdArr?.length > 0 && match_list?.length > 0) {
        for (let i = 0; i < match_list?.length; i++) {
          match_list[i]["is_active"] = matchIdArr.indexOf(match_list[i]["match_id"]) > -1 ? 1 : 0;
          
        }
      }

      return res.send(
        response(
          {
            total_count: total_count,
            match_list: match_list,
            status: match_list.length > 0 ? true : false,
          },
          match_list.length > 0 ? "Match view succesfully.!!!" : "No data found.!!!"
        )
      );
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },

  match_activity_list: async (req, res) => {
    try {
      const cktDbConnection = await connectWithCricketDb();
      const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);

      let limit = req.query.page != undefined ? parseInt(req.query.limit) : 10;
      let page = req.query.page != undefined ? parseInt(req.query.page) : 0;
      let skip = page * limit;
      //limit and pagination

      let currentDate = currentTimeZoneDate();

      
      let match_list = await UpcomingCricketsSchema.find(
        {
          rstatus: 1,
          is_players: 1,
          date_start_ist: { $gt: currentDate },
        },
        {
          cid: 1,
          match_id: 1,
          title: 1,
          subtitle: 1,
          date_start_ist: 1,
          rstatus:1
        }
      )
        .sort({ date_start_ist: 1 })
        .skip(skip)
        .limit(limit)
        .exec();

      //count
      let total_count = await UpcomingCricketsSchema.countDocuments({
        rstatus: 1,
        is_players: 1,
        date_start_ist: { $gt: currentDate },
      });

      // let matchIdArr = [];
      // if (upCkt?.length > 0) {
      //   for (let i = 0; i < upCkt?.length; i++) {
      //     matchIdArr.push(upCkt[i]["match_id"]);
      //   }
      // }

      // if (matchIdArr?.length > 0 && match_list?.length > 0) {
      //   for (let i = 0; i < match_list?.length; i++) {
      //     match_list[i]["is_active"] = matchIdArr.indexOf(match_list[i]["match_id"]) > -1 ? 1 : 0;
      //   }
      // }

      return res.send(
        response(
          {
            total_count: total_count,
            match_list: match_list,
            status: match_list.length > 0 ? true : false,
          },
          match_list.length > 0 ? "Match view succesfully.!!!" : "No data found.!!!"
        )
      );
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },

  match_list_by_status: async (req, res) => {
    try {
      const cktDbConnection = await connectWithCricketDb();
      const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);

      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const UpcomingCktPubSchema = createUpcomingCricketPublishModel(vendorDbConnection);

      const limit = parseInt(req.query.limit) || 50;
      const page = parseInt(req.query.page) || 0;
      const skip = page * limit;
      const params = req.query;
      const rtype = params.rtype || "UPCOMINGLIVE";

      let date_start_ist = null;
      if (params.sdate && params.edate) {
        const sdate = dateTimeChange(params.sdate);
        const edate = dateTimeChange(params.edate);
        date_start_ist = { $gte: sdate, $lte: edate };
      }

      const matchConditions = {
        rstatus: rtype === "RESULT" ? 3 : { $lt: 3 },
        is_publish: 1,
        ...(rtype === "RESULT" && { is_active: 1 }),
        ...(date_start_ist && { date_start_ist }),
      };

      let total_count = 0;
      let match_list = {};

      if (rtype == "UPCOMINGLIVE" || rtype == "RESULT") {
        match_list = await UpcomingCktPubSchema.find(matchConditions)
          .sort({ date_start_ist: rtype === "RESULT" ? -1 : 1 })
          .skip(skip)
          .limit(limit)
          .lean();

        const matchIds = match_list.map((m) => m.match_id);

        const matchList = await UpcomingCricketsSchema.aggregate([{ $match: { match_id: { $in: matchIds } } }, { $sort: { date_start_ist: 1 } }]);

        const matchListMap = Object.fromEntries(matchList.map((m) => [m.match_id, m]));

        match_list = match_list.map((match) => ({
          ...matchListMap[match.match_id],
          ...match,
        }));

        total_count = await UpcomingCktPubSchema.countDocuments(matchConditions);
      } else {
        match_list = await UpcomingCktPubSchema.aggregate([
          { $match: { rstatus: 4, is_publish: 1, ...(date_start_ist && { date_start_ist }) } },
          {
            $lookup: {
              from: "join_match_contests",
              let: { matchId: "$match_id" },
              pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$match_id", "$$matchId"] }, { $eq: ["$is_cancel", 1] }] } } }],
              as: "joinmconts",
            },
          },
          {
            $lookup: {
              from: "join_acc_players",
              let: { matchId: "$match_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ["$match_id", "$$matchId"] }, { $eq: ["$is_cancel", 1] }],
                    },
                  },
                },
              ],
              as: "joinsaccplys",
            },
          },
          {
            $match: {
              $or: [{ "joinmconts.0": { $exists: true } }, { "joinsaccplys.0": { $exists: true } }],
            },
          },
          {
            $project: {
              joinmconts: { $size: "$joinmconts" },
              joinsaccplys: { $size: "$joinsaccplys" },
              match_id: 1,
              title: 1,
              is_playing11: 1,
              is_paid: 1,
              plyacc_ispaid: 1,
              status_note: 1,
              date_start_ist: 1,
            },
          },
          { $limit: 10 }, //Todo: Why we have default value here?
        ]).exec();

        const matchIds = match_list.map((m) => m.match_id);

        const matchList = await UpcomingCricketsSchema.find({ match_id: { $in: matchIds } }).lean();

        const matchListMap = new Map(matchList.map((matchDetail) => [matchDetail.match_id, matchDetail]));

        match_list = match_list.map((matchDetail) => {
          const matchedMatch = matchListMap.get(matchDetail.match_id);

          return {
            ...matchedMatch,
            ...matchDetail,
          };
        });

        total_count = 10; // Todo: Why the total_count is 10 here
      }

      return res.send(
        response(
          {
            total_count: total_count,
            match_list: match_list,
            status: match_list.length > 0 ? true : false,
          },
          match_list.length > 0 ? "Match view succesfully.!!!" : "No data found.!!!"
        )
      );
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },

  football_match_list_by_status: async (req, res) => {
    try {
      const footballDbConnection = await connectWithFootballDb();
      const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);

      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const UpcomingFbPublishSchema = createUpcomingFootballPublishModel(vendorDbConnection);

      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const page = req.query.page ? parseInt(req.query.page) : 0;
      const rtype = req.query.rtype || "UPCOMINGLIVE";
      const skip = page * limit;
      const params = req.query;

      let sdate = params.sdate ? dateTimeChange(params.sdate) : null;
      let edate = params.edate ? dateTimeChange(params.edate) : null;
      const date_start_ist = sdate && edate ? { $gte: sdate, $lte: edate } : undefined;

      let total_count = 0;
      let match_list = {};

      const matchConditions = {
        is_publish: 1,
        ...(rtype === "RESULT" ? { rstatus: 3, is_active: 1 } : { rstatus: { $lt: 3 } }),
        ...(date_start_ist && { date_start_ist }),
      };

      if (rtype == "UPCOMINGLIVE" || rtype == "RESULT") {
        match_list = await UpcomingFbPublishSchema.find(matchConditions)
          .sort({ date_start_ist: rtype === "RESULT" ? -1 : 1 })
          .skip(skip)
          .limit(limit)
          .lean();

        const matchIds = match_list.map((m) => m.match_id);

        const matchList = await FbUpcomingsSchema.aggregate([{ $match: { match_id: { $in: matchIds } } }, { $sort: { date_start_ist: rtype === "RESULT" ? -1 : 1 } }]);

        const matchListMap = Object.fromEntries(matchList.map((m) => [m.match_id, m]));

        match_list = match_list.map((match) => ({
          ...matchListMap[match.match_id],
          ...match,
        }));

        total_count = await UpcomingFbPublishSchema.countDocuments(matchConditions);
      } else {
        match_list = await UpcomingFbPublishSchema.aggregate([
          { $match: { rstatus: 4, is_publish: 1, ...(date_start_ist && { date_start_ist }) } },
          {
            $lookup: {
              from: "join_match_contests",
              localField: "match_id",
              foreignField: "match_id",
              as: "joinmconts",
              pipeline: [{ $match: { is_cancel: 1 } }],
            },
          },

          {
            $lookup: {
              from: "join_acc_players",
              localField: "match_id",
              foreignField: "match_id",
              as: "joinsaccplys",
              pipeline: [{ $match: { is_cancel: 1 } }],
            },
          },

          {
            $match: {
              $expr: {
                $or: [{ $gt: [{ $size: "$joinmconts" }, 0] }, { $gt: [{ $size: "$joinsaccplys" }, 0] }],
              },
            },
          },
          {
            $project: {
              joinmconts: { $size: "$joinmconts" },
              joinsaccplys: { $size: "$joinsaccplys" },
              match_id: 1,
              title: 1,
              is_playing11: 1,
              is_paid: 1,
              plyacc_ispaid: 1,
              status_note: 1,
              date_start_ist: 1,
            },
          },
          {
            $limit: 10,
          },
        ]);

        const matchIds = match_list.map((m) => m.match_id);

        const matchList = await FbUpcomingsSchema.find({ match_id: { $in: matchIds } }).lean();

        const matchListMap = new Map(matchList.map((matchDetail) => [matchDetail.match_id, matchDetail]));

        match_list = match_list.map((matchDetail) => {
          const matchedMatch = matchListMap.get(matchDetail.match_id);

          return {
            ...matchedMatch,
            ...matchDetail,
          };
        });

        total_count = 10;
      }

      return res.send(
        response(
          { total_count: total_count, match_list: match_list, status: match_list.length > 0 ? true : false },
          match_list.length > 0 ? "Match view succesfully.!!!" : "No data found.!!!"
        )
      );
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
  series_match_list: async (req, res) => {
    try {
      const params = req.body;

      let limit = req?.query?.page ? parseInt(req.query.limit) : 10;
      let page = req?.query?.page ? parseInt(req.query.page) : 0;
      let skip = page * limit;

      const responseData = {
        total_count: 0,
        series_list: [],
        status: false,
      };

      let currentDates = currentTimeZoneDate();
      
      let conditionPub = {
        status: { $in: ["upcoming", "live"] },
        date_start: { $lt: currentDates },
        date_end: { $gt: currentDates },
        is_active: 1,
      };

      let condition = {
        status: { $in: ["upcoming", "live"] },
        date_start: { $lt: currentDates },
        date_end: { $gt: currentDates },
      };

      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      let upLegPub = null;
      let match_list = null;
      let total_count = 0;

      if (req.query.type == "ckt") {
        const cktDbConnection = await connectWithCricketDb();
        const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);

        const CktLeaguesPubSchema = createCktLeaguesPubModel(vendorDbConnection);
        upLegPub = await CktLeaguesPubSchema.find(conditionPub, {
          cid: 1,
        });

        match_list = await CktLeaguesSchema
          // .aggregate([
          //   {
          //     "$match": {
          //       status: { $in: ["upcoming", "live"] },
          //       date_start_ist: { $lt: currentDates },
          //       date_end_ist: { $gt: currentDates },
          //     }
          //   },
          //   {
          //     "$lookup": {
          //       from: "ckt_league_details",
          //       localField: "league_id",
          //       foreignField: "league_id",
          //       as: "leaguedetails"
          //     }
          //   },
          //   {
          //     $unwind: {
          //       "path": "$leaguedetails",
          //       "preserveNullAndEmptyArrays": true
          //     }
          //   },
          //   { "$skip": skip },
          //   { "$limit": limit },
          // ]);
          .find(condition, {
            _id: 1,
            category: 1,
            cid: 1,
            date_start: 1,
            date_start_ist: 1,
            date_end: 1,
            date_end_ist: 1,
            match_format: 1,
            name: 1,
            season: 1,
            status: 1,
            total_matches: 1,
            total_rounds: 1,
            total_teams: 1,
            type: 1,
          })
          .skip(skip)
          .limit(limit);

        total_count = await CktLeaguesSchema.countDocuments(condition);
      } else {
        const footballDbConnection = await connectWithFootballDb();
        const FbLeaguesSeasonsSchema = createFbLeaguesSeasonsModel(footballDbConnection);

        const FbLeaguesPubSchema = createFbLeaguesPubModel(vendorDbConnection);
        upLegPub = await FbLeaguesPubSchema.find(conditionPub, {
          id: 1,
        });

        match_list = await FbLeaguesSeasonsSchema.aggregate([
          {
            $match: {
              status: { $in: ["upcoming", "live"] },
              date_start_ist: { $lt: currentDates },
              date_end_ist: { $gt: currentDates },
            },
          },
          {
            $lookup: {
              from: "fb_league_details",
              localField: "league_id",
              foreignField: "id",
              as: "leaguedetails",
            },
          },
          {
            $unwind: {
              path: "$leaguedetails",
              preserveNullAndEmptyArrays: true,
            },
          },
          { $skip: skip },
          { $limit: limit },
        ]);

        total_count = await FbLeaguesSeasonsSchema.countDocuments(condition);
      }

      let matchIdArr = [];
      if (upLegPub?.length > 0) {
        for (let i = 0; i < upLegPub?.length; i++) {
          let idL = req.query.type == "ckt" ? upLegPub[i]["cid"] : upLegPub[i]["id"];
          matchIdArr.push(idL);
        }
      }

      let matchList = [];
      //if (matchIdArr?.length > 0 && match_list?.length > 0) {
      for (let i = 0; i < match_list?.length; i++) {
        let idL = req.query.type == "ckt" ? match_list[i]["cid"] : match_list[i]["season_id"];
        matchList.push({
          date_start:(req.query.type == "ckt")? match_list[i]["date_start"]:match_list[i]["date_start"],
          date_start_ist: (req.query.type == "ckt")?match_list[i]["date_start"]:match_list[i]["date_start_ist"],
          id: req.query.type == "ckt" ? match_list[i]["cid"] : match_list[i]["id"],
          cid: req.query.type == "ckt" ? match_list[i]["cid"] : match_list[i]["id"],
          league_id: req.query.type == "ckt" ? match_list[i]["cid"] : match_list[i]["league_id"],
          season_id: match_list[i]["season_id"],
          season_name: req.query.type == "ckt" ? match_list[i]["name"] : match_list[i]["leaguedetails"]["name"],
          status: match_list[i]["status"],
          name: req.query.type == "ckt" ? match_list[i]["name"] : match_list[i]["leaguedetails"]["name"],
          category: req.query.type == "ckt" ? match_list[i]["category"] : match_list[i]["leaguedetails"]["category"],
          match_format: match_list[i]["match_format"],
          is_active: matchIdArr.indexOf(idL) > -1 ? 1 : 0,
          date_end: req.query.type == "ckt" ? match_list[i]["date_end"] : match_list[i]["date_end"],
          date_end_ist: req.query.type == "ckt" ? match_list[i]["date_end"] : match_list[i]["date_end_ist"],
        });
      }
      //}

      responseData.total_count = total_count;
      responseData.series_list = matchList;
      responseData.status = match_list.length > 0 ? true : false;

      return res.send(response(responseData, responseData.status ? "data found succesfully.!!!" : "No data found.!!!"));
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
  Match_active_inactive: async (req, res) => {
    try {
      const cktDbConnection = await connectWithCricketDb();
      const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);

      const params = req.body;
      let response_array = {
        status: false,
        data: {},
        message: "Data is not Update",
      };

      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const UpcomingCktPubSchema = createUpcomingCricketPublishModel(vendorDbConnection);
      params.match_id = parseInt(params.match_id);
      let upCkt = await UpcomingCricketsSchema.findOne({
        match_id: params.match_id,
      });
      var authHeader = req.headers.authorization;
      if(upCkt?.is_players!==1){
         const options = {
              method: 'POST',
              url: process.env.cronapi+'/cricket/v1/update-player/'+params.match_id,
              headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader,
              }
            };
        
            axios.request(options).then(async function (result) {
              // return result.data;
            }).catch(function (error) {
              // return res.status(400).send(response({}, "Something went wrong.!!!", false,null,error.stack));
            });
      }
      

      // Use Mongoose's collection API for direct database interaction
      await UpcomingCktPubSchema.updateOne(
        { match_id: params.match_id },
        {
          $set: {
            is_active: params.is_active,
            rstatus: upCkt.rstatus,
            date_start_ist: upCkt.date_start_ist,
          },
        },
        { upsert: true }
      );

      response_array.status = true;
      if (params.is_active == 1) {
        response_array.message = "Match Active Successfully!!!";
      } else if (params.is_active == 0) {
        response_array.message = "Match Deactive Successfully!!!";
      } else if (params.is_active == 2) {
        response_array.message = "Match Deleted Successfully!!!";
      }
      return res.send(response_array);
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
  Match_cancel: async (req, res) => {
    try {
      const cktDbConnection = await connectWithCricketDb();
      const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);

      //FORCHECK
      const params = req.body;
      let response_array = {
        status: false,
        data: {},
        message: "Data is not Update",
      };
      //Todo: we can delete this once API will done
      // let send_array = {};
      // if (params.is_active) {
      //   send_array.r_satus = params.is_cancel;
      // }

      await UpcomingCricketsSchema.updateOne({ match_id: params.match_id }, { $set: params });

      response_array.status = true;

      response_array.message = "Match Deleted Successfully!!!";

      return res.send(response_array);
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },

  match_active_list: async (req, res) => {
    try {
      const cktDbConnection = await connectWithCricketDb();
      const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);

      let limit = req.query.page ? parseInt(req.query.limit) : 10;
      let page = req.query.page ? parseInt(req.query.page) : 0;
      let skip = page * limit;

      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const UpcomingCktPubSchema = createUpcomingCricketPublishModel(vendorDbConnection);
      let currentDate = currentTimeZoneDate();
      let upCkt = await UpcomingCktPubSchema.find(
        {
          rstatus: 1,
          is_active: 1,
          date_start_ist: { $gt: currentDate },
        },
        { match_id: 1, is_publish: 1 }
      )
        .skip(skip)
        .limit(limit)
        .sort({ date_start_ist: -1 });

      let matchIdArr = [];
      let matchIdPublishArr = [];
      if (upCkt?.length > 0) {
        for (let i = 0; i < upCkt?.length; i++) {
          matchIdArr.push(upCkt[i]["match_id"]);
          if (upCkt[i]["is_publish"] == 1) {
            matchIdPublishArr.push(upCkt[i]["match_id"]);
          }
        }
      }

      let match_list = await UpcomingCricketsSchema.find(
        { match_id: { $in: matchIdArr } },
        {
          match_id: 1,
          title: 1,
          cid: 1,
          date_start_ist: 1,
          subtitle: 1,
        }
      );

      if (matchIdPublishArr?.length > 0 && match_list?.length > 0) {
        for (let i = 0; i < match_list?.length; i++) {
          match_list[i]["is_publish"] = matchIdPublishArr.indexOf(match_list[i]["match_id"]) > -1 ? 1 : 0;
        }
      }

      let total_count = await UpcomingCktPubSchema.countDocuments({
        match_id: { $in: matchIdArr },
      });

      return res.send(
        response(
          {
            total_count: total_count,
            match_list: match_list,
            status: match_list.length > 0 ? true : false,
          },
          match_list.length > 0 ? "Match view succesfully.!!!" : "No data found.!!!"
        )
      );
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },

  seires_active_list: async (req, res) => {
    try {
      const params = req.body;
      let limit = req?.query?.page ? parseInt(req.query.limit) : 10;
      let page = req?.query?.page ? parseInt(req.query.page) : 0;
      let skip = page * limit;

      //limit and pagination
      // let currentDates = currentTimeZoneDate();
      // let condition = {
      //   $or: [
      //     { status: "upcoming" },
      //     {
      //       status: "live",
      //       date_start: { $lt: currentDates },
      //       date_end: { $gt: currentDates },
      //     },
      //   ],
      //   "is_active": 1,
      // };

      let currentDates = currentTimeZoneDate();
      let conditionPub = {
        status: { $in: ["upcoming", "live"] },
        date_start: { $lt: currentDates },
        date_end: { $gt: currentDates },
        is_active: 1,
      };

      const responseData = {
        total_count: 0,
        active_series_list: [],
        status: false,
      };

      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);

      let match_list = null;
      let upLegPub = null;
      let total_count = 0;
      let matchList = [];
      if (req.query.type == "ckt") {
        const cktDbConnection = await connectWithCricketDb();
        const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);
        const CktLeaguesPubSchema = createCktLeaguesPubModel(vendorDbConnection);

        upLegPub = await CktLeaguesPubSchema.find(conditionPub, {
          cid: 1,
          is_publish: 1,
        });

        let matchIdArr = [];
        let matchIdPublishArr = [];
        if (upLegPub?.length > 0) {
          for (let i = 0; i < upLegPub?.length; i++) {
            matchIdArr.push(upLegPub[i]["cid"]);
            if (upLegPub[i]["is_publish"] == 1) {
              matchIdPublishArr.push(upLegPub[i]["cid"]);
            }
          }
        }

        match_list = await CktLeaguesSchema.find({
          cid: { $in: matchIdArr },
        })
          .sort({ date_start: 1 })
          .skip(skip)
          .limit(limit).lean();

        if (match_list?.length > 0) {
          for (let i = 0; i < match_list?.length; i++) {
            match_list[i]["is_publish"] = matchIdPublishArr.indexOf(match_list[i]["cid"]) > -1 ? 1 : 0;
          }
        }
        total_count = await CktLeaguesPubSchema.countDocuments(conditionPub);
      } else {
        const footballDbConnection = await connectWithFootballDb();
        const FbLeaguesSeasonsSchema = createFbLeaguesSeasonsModel(footballDbConnection);

        const FbLeaguesPubSchema = createFbLeaguesPubModel(vendorDbConnection);
        upLegPub = await FbLeaguesPubSchema.find(conditionPub, {
          id: 1,
          is_publish: 1,
        });

        let matchIdArr = [];
        let matchIdPublishArr = [];
        if (upLegPub?.length > 0) {
          for (let i = 0; i < upLegPub?.length; i++) {
            matchIdArr.push(upLegPub[i]["id"]);
            if (upLegPub[i]["is_publish"] == 1) {
              matchIdPublishArr.push(upLegPub[i]["id"]);
            }
          }
        }

        match_list = await FbLeaguesSeasonsSchema.aggregate([
          {
            $match: { season_id: { $in: matchIdArr } },
          },
          { $sort: { date_start_ist: 1 } },
          {
            $lookup: {
              from: "fb_league_details",
              localField: "league_id",
              foreignField: "id",
              as: "leaguedetails",
            },
          },
          {
            $unwind: {
              path: "$leaguedetails",
              preserveNullAndEmptyArrays: true,
            },
          },
          { $skip: skip },
          { $limit: limit },
        ]);

        //if (matchIdPublishArr?.length > 0 && match_list?.length > 0) {
        for (let i = 0; i < match_list?.length; i++) {
          matchList.push({
            date_start: match_list[i]["date_start_ist"],
            date_start_ist: match_list[i]["date_start_ist"],
            id: match_list[i]["id"],
            league_id: match_list[i]["league_id"],
            season_id: match_list[i]["season_id"],
            season_name: match_list[i]["leaguedetails"]["name"],
            status: match_list[i]["status"],
            name: match_list[i]["leaguedetails"]["name"],
            category: match_list[i]["leaguedetails"]["category"],

            is_publish: matchIdPublishArr.indexOf(match_list[i]["season_id"]) > -1 ? 1 : 0,
          });
          //match_list[i]["is_publish"] = matchIdPublishArr.indexOf(match_list[i]["id"]) > -1 ? 1 : 0
        }
        //}

        total_count = await FbLeaguesPubSchema.countDocuments(conditionPub);
      }

      responseData.total_count = total_count;
      responseData.active_series_list = req.query.type == "ckt" ? match_list : matchList;
      responseData.status = (req.query.type == "ckt" ? match_list.length : matchList.length) > 0 ? true : false;

      return res.send(response(responseData, responseData.status ? "Active Series List succesfully.!!!" : "No data found.!!!"));
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },

  Series_active_inactive_ckt: async (req, res) => {
    try {
      const cktDbConnection = await connectWithCricketDb();
      const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);

      const params = req.body;
      let response_array = {
        status: false,
        data: {},
        message: "Data is not Update",
      };

      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const CktLeaguesPubSchema = createCktLeaguesPubModel(vendorDbConnection);
      
      params.cid = parseInt(params.cid);
      let upCkt = await CktLeaguesSchema.findOne({ cid: params.cid });

      let updateData = {
        cid: params.cid,
        status: upCkt.status,
        date_start: upCkt.date_start,
        date_end: upCkt.date_end,
      };
      if (params.is_active == 0 || params.is_active == 1) {
        updateData["is_active"] = params.is_active;
      } else if (params.is_publish == 0 || params.is_publish == 1) {
        updateData["is_publish"] = params.is_publish;
      }

      // Use Mongoose's collection API for direct database interaction
      await CktLeaguesPubSchema.updateOne({ cid: params.cid }, { $set: updateData }, { upsert: true });
      await CktLeaguesSchema.updateOne({ cid: params.cid }, { $set: {"is_allpublish":1} }, { upsert: true });

      response_array.status = true;
      if (params.is_active == 1) {
        response_array.message = "Series Active Successfully!!!";
      } else if (params.is_active == 0) {
        response_array.message = "Series Deactive Successfully!!!";
      } else if (params.is_active == 2) {
        response_array.message = "Series Deleted Successfully!!!";
      } else if (params.is_publish == 0) {
        response_array.message = "Series UnPublish Successfully!!!";
      } else if (params.is_publish == 1) {
        response_array.message = "Series Publish Successfully!!!";
      }

      return res.send(response_array);
      // }
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
  Series_active_inactive_fb: async (req, res) => {
    try {
      const footballDbConnection = await connectWithFootballDb();
      const FbLeaguesSeasonsSchema = createFbLeaguesSeasonsModel(footballDbConnection);

      const params = req.body;
      let response_array = {
        status: false,
        data: {},
        message: "Data is not Update",
      };

      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const FbLeaguesPubSchema = createFbLeaguesPubModel(vendorDbConnection);
      params.cid = parseInt(params.cid);
      let upFb = await FbLeaguesSeasonsSchema.findOne({
        season_id: params.cid,
      });

      let updateData = {
        status: upFb.status,
        date_start: upFb.date_start_ist,
        date_end: upFb.date_end_ist,
      };
      if (params.is_active == 0 || params.is_active == 1) {
        updateData["is_active"] = params.is_active;
      } else if (params.is_publish == 0 || params.is_publish == 1) {
        updateData["is_publish"] = params.is_publish;
      }

      
      // Use Mongoose's collection API for direct database interaction
      await FbLeaguesPubSchema.updateOne({ id: params.cid }, { $set: updateData }, { upsert: true });
      await FbLeaguesSeasonsSchema.updateOne({ season_id: params.cid }, { $set: { is_allpublish: 1 } });
      
      response_array.status = true;
      if (params.is_active == 1) {
        response_array.message = "Series Active Successfully!!!";
      } else if (params.is_active == 0) {
        response_array.message = "Series Deactive Successfully!!!";
      } else if (params.is_active == 2) {
        response_array.message = "Series Deleted Successfully!!!";
      } else if (params.is_publish == 0) {
        response_array.message = "Series UnPublish Successfully!!!";
      } else if (params.is_publish == 1) {
        response_array.message = "Series Publish Successfully!!!";
      }
      return res.send(response_array);
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
  match_publish: async (req, res) => {
    try {
      const cktDbConnection = await connectWithCricketDb();
      const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);

      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const PoolSchema = createPoolModel(vendorDbConnection);
      const UpcomingCktPubSchema = createUpcomingCricketPublishModel(vendorDbConnection);

      const params = req.body;

      let apikey = req.user.apikey;

      let response_array = {
        status: false,
        data: {},
        message: "Data is not Update",
      };
      //Todo: We can remove this once API will be done
      // let send_array = {};
      // let pubKey = "is_publish";
      // send_array[pubKey] = params.is_publish;
      // if (params.is_publish == 1) {
      //   send_array["is_allpublish"] = 1;
      // }
      let check_active_pool = await PoolSchema.find({
        match_id: params.match_id,
      });

      if (check_active_pool.length > 0) {
        // Use Mongoose's collection API for direct database interaction
        let upCktVendor = await UpcomingCktPubSchema.updateOne({ match_id: params.match_id }, { $set: { is_publish: params.is_publish } });

        await UpcomingCricketsSchema.updateOne({ match_id: params.match_id }, { $set: { is_allpublish: 1 } });

        if (upCktVendor) {
          socketConnection();
          socket.emit("fix_live_result_match_data_v2", {
            rstatus: 1,
            fetch_latest: 1,
            type: "Cricket",
            cronapikey: apikey,
          });
        }

        response_array.status = true;
        if (params.is_publish == 1) {
          response_array.message = "Match Publish Successfully!!!";
        } else if (params.is_publish == 0) {
          response_array.message = "Match Unpublish Successfully!!!";
        }
        return res.send(response_array);
      } else {
        return res.status(400).send(response({}, `Please add pool.`, false));
      }
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
  fantasy_list: async (_, res) => {
    try {
      const connection = await connectWithGeneralDb();
      const FantasyPointsSchema = createFantasyPointsModel(connection);

      const fantasy_data = await FantasyPointsSchema.find({});

      return res.send({ fantasy_data }, "Data found successfully", true);
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
  fantasygame_list: async (req, res) => {
    try {
      const connection = await connectWithGeneralDb();
      const FantasyPointsSchema = createFantasyPointsModel(connection);

      const params = req.body;
      let response_array = {
        status: false,
        data: {},
        message: "Data is not Found",
      };
      if (params && params.game_id != undefined) {
        response_array.data = await FantasyPointsSchema.find({ game_id: params.game_id }, { game_id: 1, type: 1 });
        //Todo: Old code with API key
        // response_array.data = await fantasypointSchema(req.user.apikey).find(
        //   { game_id: params.game_id },
        //   { game_id: 1, type: 1 }
        // );
      }
      return res.send(response_array);
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
  fantasygame_type_list: async (req, res) => {
    try {
      const connection = await connectWithGeneralDb();
      const FantasyPointsSchema = createFantasyPointsModel(connection);

      const params = req.body;
      let response_array = {
        status: false,
        data: {},
        message: "Data is not Found",
      };
      if (params && params.game_id != undefined && params.type != undefined) {
        response_array.data = await FantasyPointsSchema.find({ game_id: params.game_id, type: params.type }, { game_id: 1, type: 1, points: 1 });
        //Todo: Old code with apikey
        // response_array.data = await fantasypointSchema(req.user.apikey).find(
        //   { game_id: params.game_id, type: params.type },
        //   { game_id: 1, type: 1, points: 1 }
        // );
      }
      return res.send(response_array);
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
  update_fantasygame_points: async (req, res) => {
    try {
      const { game_id, type, points } = req.body;

      const connection = await connectWithGeneralDb();
      const FantasyPointsSchema = createFantasyPointsModel(connection);

      const updateResult = await FantasyPointsSchema.updateMany({ game_id: parseInt(game_id), type: type }, { $set: points });

      if (updateResult.modifiedCount === 0) {
        return res.status(400).send(response({}, "No records updated.", false));
      }

      return res.send({ status: true, message: "Update successfully" });
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
  // get match list  for admin report
get_current_match_list : async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const size = parseInt(req.query.size);
    let offset = (page - 1) * size;
    // let skip = page * size;
    let rstatus = req.body.rstatus;
    let game_type = req.body.game_type;
    let match_name = req.body.match_name;
    let league_id = req.body.league_id;

    if (!game_type) {
      return res.send(response({}, "Select Game Type", false, null, null));
    }

    let condition = {};
      condition["rstatus"] = 1;

    if (league_id) {
      if (game_type === "ckt") {
        condition["cid"] = parseInt(league_id);
      } else if (game_type === "fb") {
        condition["season_id"] = parseInt(league_id);
      }
    }

    if (match_name) {
      condition["title"] = new RegExp(match_name, "i");
    }
    let currentDate = currentTimeZoneDate();
    if (game_type === "ckt") {
      condition["date_end_ist"] = {"$gt":currentDate};
    }else{
      condition["date_start_ist"] = {"$gt":currentDate};
    }
    
    let find_table_name;
    if (game_type === "ckt") {
      const cktDbConnection = await connectWithCricketDb();
      const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);

      find_table_name = await UpcomingCricketsSchema.find(condition, { match_id: 1, title: 1, date_start_ist: 1 }).sort({ date_start_ist: 1 });
      
    } else {
      const footballDbConnection = await connectWithFootballDb();
      const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);

      find_table_name = await FbUpcomingsSchema.aggregate([
        { $match: condition },
        { $project: { match_id: 1, title: { $concat: ["$teama.name", " vs ", "$teamb.name"] }, date_start_ist: 1 } },
        {"$sort": { date_start_ist: 1 }},
      ]);
    }

    //let match_list = await find_table_name.find(condition,{"match_id":1,"title":1,"date_start_ist":1}).sort({date_start_ist:-1}).limit(size);

    let match_list = find_table_name;

    return res.send(
      response(
        {
          match_list: match_list,
          status: match_list.length > 0 ? true : false,
        },
        match_list.length > 0 ? "Match view succesfully.!!!" : "No data found.!!!"
      )
    );
  } catch (error) {
    return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
  }
}
};
