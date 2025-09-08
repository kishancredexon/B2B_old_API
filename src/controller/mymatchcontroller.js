const env = process.env;
const response = require("../../helper/response");
const { sortingData, dateTimeZone, dateTimeChange, keyGen, currentTimeZoneDate } = require('../../helper/common');
const { connectWithCricketDb, connectWithFootballDb, connectWithVendorDb } = require("../../config/mongodb_connections");
const createCktTeamMetaDataModel = require("../../mongo_models_new/credexon_cricket/CktTeamMetaDataSchema");
const createCktLeaguesModel = require("../../mongo_models_new/credexon_cricket/CktLeaguesSchema");
const createUpcomingCricketModel = require("../../mongo_models_new/credexon_cricket/UpcomingCricketsSchema");
const createCktSeriesMetaDataModel = require("../../mongo_models_new/credexon_cricket/CktSeriesMetaDataSchema");
const createFbUpcomingsModel = require("../../mongo_models_new/credexon_football/FbUpcomingsSchema");
const createFbLeaguesModel = require("../../mongo_models_new/credexon_football/FbLeaguesSchema");
const createContestSeriesModel = require("../../mongo_models_new/credexon_vendor/ContestSeriesSchema");
const createUpcomingCricketPublishModel = require("../../mongo_models_new/credexon_vendor/UpcomingCricketsSchema");
const createCktLeaguesPubModel = require("../../mongo_models_new/credexon_vendor/CktLeaguesPubSchema");
const { ObjectId } = require("bson");
const createFbLeaguesPubModel = require("../../mongo_models_new/credexon_vendor/FbLeaguesPubSchema");
const createFbPlayerDetailsModel = require("../../mongo_models_new/credexon_football/FbPlayerDetailsSchema");

module.exports = {
    my_match_cricket_list: async (req, res, next) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);
            const UpcomingCricketPublish=createUpcomingCricketPublishModel();

            const params = req.body;
            params.rstatus = parseInt(params.rstatus);
            params.userid = req.user.id;
            const page = parseInt(req.query.page || 1)
            let limit = parseInt(req.query.limit || 10);
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            //limit and pagination 
            params.rstatus = parseInt(params.rstatus);
            limit = (params.rstatus === 3) ? 20 : limit;
            let d_sort = (params.rstatus === 3) ? -1 : 1;
            let sort_match = (params.rstatus === 3) ? { date_start: d_sort } : { date_start: d_sort };
            let rStatus = (params.rstatus === 3) ? { "$in": [3, 4] } : params.rstatus;
            
            let my_match_list = await UpcomingCricketPublish.distinct("match_id",{"rstatus": rStatus, "is_active": 1,
                        "is_publish": 1});
            console.log("params.rstatus--->>", params.rstatus)
            let match_list = await UpcomingCricketsSchema.aggregate([
                {
                    $match: {
                        "match_id":{"$in":my_match_list}
                    }
                },
                {
                    $lookup:
                    {
                        from: "join_match_contests",
                        localField: "match_id",
                        foreignField: "match_id",
                        as: "poolpb",
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$userid', params.userid] },
                                        ]
                                    }
                                }
                            }]
                    }
                },
                {
                    $lookup:
                    {
                        from: "joinsaccplys" + dbkey,
                        localField: "match_id",
                        foreignField: "match_id",
                        as: "accplys",
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$userid', params.userid] },
                                        ]
                                    }
                                }
                            }]
                    }
                },
                {
                    $match: { "$or": [{ poolpb: { $gte: [{ $size: "$poolpb" }, 1] } }, { accplys: { $gte: [{ $size: "$accplys" }, 1] } }] }
                },
                {
                    $group:
                    {
                        _id: { "_id": "$_id" }, match_id: { $first: "$match_id" }, league_name: { $first: "$competition.title" }, title: { $first: "$title" }, date_start: { $first: "$date_start_ist" }, date_end: { $first: "$date_end_ist" }, short_title: { $first: "$short_title" }
                        , teama_name: { $first: "$teama.name" }, teama_id: { $first: "$teama.team_id" }, teama_short_name: { $first: "$teama.short_name" }, teama_logo: { $first: "$teama.logo_url" }
                        , teamb_name: { $first: "$teamb.name" }, teamb_id: { $first: "$teamb.team_id" }, teamb_short_name: { $first: "$teamb.short_name" }, teamb_logo: { $first: "$teamb.logo_url" }
                        , poolpbcnt: { $first: { $size: "$poolpb" } }, accplyscnt: { $first: { $size: "$accplys" } },
                        "match_status": { $first: "$rstatus" },
                        "is_active": { $first: "$is_active" + dbkey }
                        , cid: { $first: "$cid" },
                        total: { "$sum": 1 }
                    }
                },
                { $unset: ["_id"] },
                { $sort: sort_match },
                {
                    $facet: {
                        data: [{ $skip: startIndex }, { $limit: limit }],
                        total_count: [
                            {
                                $count: 'count'
                            }
                        ]
                    }
                }

            ])

            if ((match_list && match_list[0] && match_list[0].data)) {
                const cktDbConnection = await connectWithCricketDb();
                const CktTeamMetaDataSchema = createCktTeamMetaDataModel(cktDbConnection);

                MatchImg = await Promise.all(match_list[0].data.map(async (item) => {
                    item["date_start"] = dateTimeZone(item["date_start"], req.user.timezone);//timeChange(req.user.id,item["date_start"])
                    let teamMeta = await CktTeamMetaDataSchema.find({
                        team_id: { "$in": [item.teama_id] }
                    })
                    let teamDetailMetaA = teamMeta.filter(x => x.team_id == item.teama_id);
                    teamDetailMetaA = teamDetailMetaA && teamDetailMetaA[0];
                    return item.teama_logo = (teamDetailMetaA && teamDetailMetaA.logo_url) ? `${env.awsimgurl}profile_doc/${teamDetailMetaA.logo_url}` : item.teama_logo;
                    //console.log("team_id==>", item.teama_id );

                }))
                MatchImg = await Promise.all(match_list[0].data.map(async (item) => {
                    let teamMeta = await CktTeamMetaDataSchema.find({
                        team_id: { "$in": [item.teamb_id] }
                    })
                    let teamDetailMetaB = teamMeta.filter(x => x.team_id == item.teamb_id);
                    teamDetailMetaB = teamDetailMetaB && teamDetailMetaB[0];
                    return item.teamb_logo = (teamDetailMetaB && teamDetailMetaB.logo_url) ? `${env.awsimgurl}profile_doc/${teamDetailMetaB.logo_url}` : item.teamb_logo;
                }))
            }

            let dataCount = (match_list && match_list[0] && match_list[0].total_count && match_list[0].total_count[0] && match_list[0].total_count[0]["count"]) ? match_list[0].total_count[0]["count"] : 0;
            let dataList = (match_list && match_list[0] && match_list[0].data) ? match_list[0].data : [];
            let status = dataCount > 0 ? true : false;

            dataList = sortingData(dataList, "date_start", d_sort)



            return res.send(response({
                total_count: dataCount,
                status_key: params.rstatus,
                match_list: dataList,

            }, dataCount > 0 ? "My1 Match view succesfully.!!!" : "No data found.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    my_match_football_list: async (req, res, next) => {
        try {
            const footballDbConnection = await connectWithFootballDb();
            const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);

            const params = req.body;
            params.userid = req.user.id;
            const page = parseInt(req.query.page || 1)
            let limit = parseInt(req.query.limit || 10);
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;

            //limit and pagination 

            limit = (params.rstatus === 3) ? 10 : limit;
            let d_sort = (params.rstatus === 3) ? -1 : 1;
            let sort_match = (params.rstatus === 3) ? { date_start: d_sort } : { date_start: d_sort };

            let match_list = await FbUpcomingsSchema.aggregate([
                {
                    $match: {"is_publish": 1, "rstatus": params.rstatus } //Todo: Need to remove dbkey
                },
                {
                    $lookup:
                    {
                        from: "joinmconts",
                        localField: "match_id",
                        foreignField: "match_id",
                        as: "poolpb",
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$userid', params.userid] },
                                        ]
                                    }
                                }
                            }]
                    }
                },
                {
                    $lookup:
                    {
                        from: "joinsaccplys" + dbkey,
                        localField: "match_id",
                        foreignField: "match_id",
                        as: "accplys",
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$userid', params.userid] },
                                        ]
                                    }
                                }
                            }]
                    }
                },
                {
                    $match: { "$or": [{ poolpb: { $gte: [{ $size: "$poolpb" }, 1] } }, { accplys: { $gte: [{ $size: "$accplys" }, 1] } }] }
                },
                {
                    $group:
                    {
                        _id: { "_id": "$_id" }, match_id: { $first: "$match_id" }, title: { $first: "$title" }, date_start: { $first: "$date_start_ist" }, date_end: { $first: "$date_end_ist" }, short_title: { $first: "$short_title" }
                        , teama_id: { $first: "$teama.team_id" }, teama_name: { $first: "$teama.name" }, teama_short_name: { $first: "$teama.short_name" }, teama_logo: { $first: "$teama.logo_url" }
                        , teamb_id: { $first: "$teamb.team_id" }, teamb_name: { $first: "$teamb.name" }, teamb_short_name: { $first: "$teamb.short_name" }, teamb_logo: { $first: "$teamb.logo_url" },
                        league_name: { $first: "$league_name" },
                        "match_status": { $first: params.rstatus },
                        total: { "$sum": 1 }
                    }
                },
                { $unset: ["_id"] },
                { $sort: sort_match },
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
            let status = dataCount > 0 ? true : false

            dataList = sortingData(dataList, "date_start", d_sort)

            dataList.map(item => {
                item["date_start"] = dateTimeZone(item["date_start"], req.user.timezone)//timeChange(req.user.id,item["date_start"])
                return item;
            })

            return res.send(response({
                total_count: dataCount,
                status_key: params.rstatus,
                match_list: dataList,
                // status: dataCount > 0 ? true : false,
            }, dataCount > 0 ? "My Match view succesfully.!!!" : "No data found.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },

    my_series_cricket_list: async (req, res, next) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);
            const CktSeriesMetaDataSchema = createCktSeriesMetaDataModel(cktDbConnection);
            

            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const ContestSeriesSchema = createContestSeriesModel(vendorDbConnection);
            const CktLeaguesPubSchema=createCktLeaguesPubModel(vendorDbConnection);

            const params = req.body
            const page = parseInt(req.query.page || 1)
            const limit = parseInt(req.query.limit || 10);
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            
            params.userid = ObjectId(req.user.id);

            let currentDates = currentTimeZoneDate();
            let condition = null;
            if (params.status === "upcoming") {
                condition = {
                    "$or": [{ status: 'upcoming' }, {
                        status: 'live',
                        date_start: { "$lt": currentDates },
                        date_end: { "$gt": currentDates }
                    }], "is_active": 1, "is_publish": 1
                };
            } else if (params.status === "live") {
                condition = { status: params.status, "is_active": 1, "is_publish": 1 };
            } else if (params.status === "result") {
                let contestsseries = await ContestSeriesSchema.find({ date_end: { "$lt": currentDates } });

                let getLeagueIds = [];
                contestsseries.forEach(item => {
                    getLeagueIds.push(item.league_id);
                })
                condition = { cid: { "$in": getLeagueIds } };
            }

            console.log("condition--->>", condition,params);
            
            //limit and pagination 
            let match_list = await CktLeaguesPubSchema.aggregate([
                {
                    $match: condition
                },
                {
                    $lookup:
                    {
                        from: "join_series_contests",//Todo: need to change according to the changes and both database are different
                        localField: "cid",
                        foreignField: "league_id",
                        as: "poolpb",
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$userid', params.userid] },
                                        ]
                                    }
                                }
                            }]
                    }
                },
                {
                    $lookup:
                    {
                        from: "join_acc_teams",
                        localField: "cid",
                        foreignField: "league_id",
                        as: "acctms",
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$userid', params.userid] },
                                        ]
                                    }
                                }
                            }]
                    }
                },
                {
                    $match: { "$or": [{ poolpb: { $gte: [{ $size: "$poolpb" }, 1] } }, { acctms: { $gte: [{ $size: "$acctms" }, 1] } }] }
                },
                // {
                //     $group:
                //     {
                //         _id: { "_id": "$_id" }, cid: { $first: "$cid" }, seasonId: { $first: "$season" }, date_end: { $first: "$date_end" }, date_start: { $first: "$date_start" }, name: { $first: "$name" }, logo_url: { $first: "$logo_url" }
                //     }
                // },
                // { $unset: ["_id"] },
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

            let CktLeaguesList = await CktLeaguesSchema.find({ "status": "live" }).lean();
            let leagueDetail={};
            CktLeaguesList.forEach(item => {
                leagueDetail[item.cid] = item;
            })

            match_list?.[0]?.data?.map(item => {
                item["name"]=leagueDetail[item.cid].name;
                item["date_start"]=leagueDetail[item.cid].date_start;
                item["date_end"]=leagueDetail[item.cid].date_end;
                return item;
            })

            match_list[0].data = match_list[0].data.map((item) => {

                // if(item && item.logo_url != null){

                let checkhttpurl = isValidHttpUrl(item.logo_url)

                if (checkhttpurl) {
                    item.image = item.logo_url
                } else {
                    item.image = item.logo_url == null ? `${env.awsimgurl}profile_doc/undefined` : `${env.awsimgurl}profile_doc/${item.logo_url}`
                }
                let series_logo_url = item.image;
                //  }

                return (item)
            })

            match_list[0].data = await Promise.all(match_list[0].data.map(async (item) => {
                let itemLogo = await CktSeriesMetaDataSchema.findOne({ league_id: item.cid });
                if (itemLogo) {
                    item.image = `${env.awsimgurl}profile_doc/${itemLogo.logo_url}`
                }

                return (item)
            }))

            let dataCount = (match_list && match_list[0] && match_list[0].total_count && match_list[0].total_count[0] && match_list[0].total_count[0]["count"]) ? match_list[0].total_count[0]["count"] : 0;
            let dataList = (match_list && match_list[0] && match_list[0].data) ? match_list[0].data : [];
            let status = dataCount > 0 ? true : false
            return res.send(response({
                total_count: dataCount,
                status_key: params.status,
                match_list: dataList,
                // status: dataCount > 0 ? true : false,
            }, dataCount > 0 ? "My series view succesfully.!!!" : "No data found.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },

    my_series_football_list: async (req, res, next) => {
        try {
            const footballDbConnection = await connectWithFootballDb();
            const FbPlayerDetailsSchema = createFbPlayerDetailsModel(footballDbConnection);

            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const FbLeaguesPubSchema=createFbLeaguesPubModel(vendorDbConnection);

            const params = req.body
            const page = parseInt(req.query.page || 1)
            const limit = parseInt(req.query.limit || 10);
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            params.userid = ObjectId(req.user.id);
            
            //limit and pagination 
            let match_list = await FbLeaguesPubSchema.aggregate([
                {
                    $match: { "status": params.status }
                },
                {
                    $lookup:
                    {
                        from: "join_series_contests",
                        localField: "season_id",
                        foreignField: "league_id",
                        as: "poolpb",
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$userid', params.userid] },
                                        ]
                                    }
                                }
                            }]
                    }
                },
                {
                    $lookup:
                    {
                        from: "join_acc_teams",
                        localField: "season_id",
                        foreignField: "league_id",
                        as: "acctms",
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$userid', params.userid] },
                                        ]
                                    }
                                }
                            }]
                    }
                },
                {
                    $match: { "$or": [{ poolpb: { $gte: [{ $size: "$poolpb" }, 1] } }, { acctms: { $gte: [{ $size: "$acctms" }, 1] } }] }
                },
                // {
                //     $group:
                //     {
                //         _id: { "_id": "$_id" }, id: { $first: "$season_id" }, date_end: { $first: "$date_end" }, date_start: { $first: "$date_start" }, name: { $first: "$name" }, logo_path: { $first: "$logo_path" }
                //     }
                // },
                // { $unset: ["_id"] },
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


            let FbLeaguesList = await FbPlayerDetailsSchema.find({ "status": "live" }).lean();
            let leagueDetail={};
            FbLeaguesList.forEach(item => {
                leagueDetail[item.id] = item;
            })

            match_list?.[0]?.data?.map(item => {
                item["name"]=leagueDetail[item.id].name;
                item["date_start"]=leagueDetail[item.id].date_start;
                item["date_end"]=leagueDetail[item.id].date_end;
                return item;
            })

            let dataCount = (match_list && match_list[0] && match_list[0].total_count && match_list[0].total_count[0] && match_list[0].total_count[0]["count"]) ? match_list[0].total_count[0]["count"] : 0;
            let dataList = (match_list && match_list[0] && match_list[0].data) ? match_list[0].data : [];
            let status = dataCount > 0 ? true : false
            return res.send(response({
                total_count: dataCount,
                status_key: params.status,
                match_list: dataList,
                // status: dataCount > 0 ? true : false,
            }, dataCount > 0 ? "My series view succesfully.!!!" : "No data found.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },



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




