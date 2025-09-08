const response = require("../../helper/response");
const { connectWithCricketDb, connectWithFootballDb, connectWithVendorDb } = require("../../config/mongodb_connections");
const createCktLeaguesModel = require("../../mongo_models_new/credexon_cricket/CktLeaguesSchema");
const createUpcomingCricketModel = require("../../mongo_models_new/credexon_cricket/UpcomingCricketsSchema");
const createCktPlayersModel = require("../../mongo_models_new/credexon_cricket/CktPlayersSchema");
const createFbUpcomingsModel = require("../../mongo_models_new/credexon_football/FbUpcomingsSchema");
const createFbPlayerDetailsModel = require("../../mongo_models_new/credexon_football/FbPlayerDetailsSchema");
const createFbLeaguesModel = require("../../mongo_models_new/credexon_football/FbLeaguesSchema");
const createCktLeaguesPubModel = require("../../mongo_models_new/credexon_vendor/CktLeaguesPubSchema");
const createFbLeaguesPubModel = require("../../mongo_models_new/credexon_vendor/FbLeaguesPubSchema");
const createFbPlayersModel = require("../../mongo_models_new/credexon_football/FbPlayersSchema");

const env = process.env;

module.exports = {
    player_acc_list: async (req, res) => {
        try {
            const responseData = {
                total_count: 0,
                active_series_list: [],
            }

            if (req.query.type == 'ckt') {
                const cktDbConnection = await connectWithCricketDb();
                const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);

                const { dbName } = req.user;
                const vendorDbConnection = await connectWithVendorDb(dbName);
                const CktLeaguesPubSchema = createCktLeaguesPubModel(vendorDbConnection);

                const stream = CktLeaguesPubSchema.find({ is_active: 1, is_publish: 1 }).select("_id cid").cursor();

                let mergedCktLeagues = [];

                for await (const pub of stream) {
                    const league = await CktLeaguesSchema.findOne({ cid: pub.cid }).select("_id name cid");

                    mergedCktLeagues.push({
                        _id: league?._id || null,
                        cid: pub.cid,
                        public_id: pub._id,
                        name: league?.name || null
                    });

                    if (mergedCktLeagues.length >= 10000) {
                        mergedCktLeagues = []; // Flush processed data to avoid high memory usage
                    }
                }

                responseData.total_count = mergedCktLeagues?.length || 0;
                responseData.active_series_list = mergedCktLeagues;
            } else {
                const footballDbConnection = await connectWithFootballDb();
                const FbLeaguesSchema = createFbLeaguesModel(footballDbConnection);

                const { dbName } = req.user;
                const vendorDbConnection = await connectWithVendorDb(dbName);
                const FbLeaguesPubSchema = createFbLeaguesPubModel(vendorDbConnection);

                const stream = FbLeaguesPubSchema.find({ is_active: 1, is_publish: 1 }).select("_id id").cursor();//We are using id here instead of season_id

                let mergedFbLeagues = [];

                for await (const pub of stream) {
                    const league = await FbLeaguesSchema.findOne({ id: pub.id }).select("_id name");

                    mergedFbLeagues.push({
                        _id: league?._id || null,
                        season_id: pub.id,
                        name: league?.name || null
                    });

                    if (mergedFbLeagues.length >= 10000) {
                        mergedFbLeagues = []; // Flush processed data to avoid high memory usage
                    }
                }

                responseData.total_count = mergedFbLeagues.length;
                responseData.active_series_list = mergedFbLeagues;
            }

            return res.send(response(responseData, responseData.active_series_list.length > 0 ? "Active Series List succesfully.!!!" : "No data found.!!!"))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    player_aac_match_list: async (req, res) => {
        try {
            const params = req.body

            if (params.type == "Cricket") {
                const cktDbConnection = await connectWithCricketDb();
                const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);

                const match_list = await UpcomingCricketsSchema.find({ cid: params.league_id })
                    .select("_id match_id title date_start_ist").lean();

                const newMatchList = match_list.map(item => ({
                    _id: item._id,
                    match_id: item.match_id,
                    title: item.title,
                    date_start_ist: item.date_start_ist
                }));

                return res.send(response({
                    match_list: newMatchList
                }, match_list.length > 0 ? "Match view succesfully.!!!" : "No data found.!!!", true))
            } else if (params.type == "Football") {
                const footballDbConnection = await connectWithFootballDb();
                const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);

                const football_list = await FbUpcomingsSchema.find({ id: params.league_id })
                    .select("_id match_id localTeam.data.name visitorTeam.data.name date_start_ist")
                    .lean();

                const newMatchList = football_list.map(item => ({
                    _id: item._id,
                    match_id: item.match_id,
                    local_name: item?.localTeam?.data?.name || "Unknown",
                    visit_name: item?.visitorTeam?.data?.name || "Unknown",
                    date_start_ist: item.date_start_ist
                }));

                return res.send(response({
                    football_list: newMatchList,
                }, football_list.length > 0 ? "Match view succesfully.!!!" : "No data found.!!!", true))
            }

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    player_acc_player_list: async (req, res) => {
        try {
            let params = req.body;

            let page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.limit) || 10;
            const startIndex = (page - 1) * limit;

            if (params.type == "Cricket") {
                const cktDbConnection = await connectWithCricketDb();
                const CktPlayersSchema = createCktPlayersModel(cktDbConnection);

                let filter = {};
                if (params.player_name) {
                    filter.first_name = { $regex: params.player_name, $options: "i" };
                }

                let playerList = await CktPlayersSchema.aggregate([
                    { $match: { match_id: params.match_id, } },
                    {
                        $lookup: {
                            from: "ckt_player_details",
                            localField: "pid",
                            foreignField: "pid",
                            as: "player_detail",
                        },
                    },
                    { $unwind: { path: "$player_detail", preserveNullAndEmptyArrays: true } },
                    ...(filter && filter.first_name
                        ? [{ $match: { "player_detail.first_name": filter.first_name } }]
                        : []
                    ),
                    {
                        $lookup: {
                            from: "ckt_player_meta_data",
                            localField: "pid",
                            foreignField: "pid",
                            as: "meta_data"
                        }
                    },
                    { $unwind: { path: "$meta_data", preserveNullAndEmptyArrays: true } },
                    {
                        $group: {
                            _id: "$pid",
                            player_id: { $first: "$pid" },
                            player_name: { $first: "$player_detail.first_name" },
                            rating: { $first: "$player_detail.fantasy_player_rating" },
                            bowling_style: { $first: "$player_detail.bowling_style" },
                            batting_style: { $first: "$player_detail.batting_style" },
                            playing_role: { $first: "$player_detail.playing_role" },
                            is_playing: { $first: "$is_playing" },
                            selectedBy: { $first: "$selectedBy" },
                            logo_url: { $first: "$meta_data.logo_url" },
                            jersy_no: { $first: "$meta_data.jersy_no" },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            player_id: 1,
                            player_name: 1,
                            rating: 1,
                            bowling_style: 1,
                            batting_style: 1,
                            playing_role: 1,
                            is_playing: 1,
                            selectedBy: 1,
                            player_image: {
                                $cond: {
                                    if: { $gt: ["$logo_url", null] },
                                    then: { $concat: [`${env.awsimgurl}profile_doc/`, "$logo_url"] },
                                    else: ""
                                }
                            },
                            jersy_no: 1
                        }
                    },
                    { $sort: { player_id: -1 } },
                    {
                        $facet: {
                            data: [{ $skip: startIndex }, { $limit: limit }], // Correct Pagination
                            total_count: [{ $count: "count" }]
                        }
                    }
                ]);

                const playerListData = playerList?.[0]?.data || [];
                const total_count = playerList?.[0]?.total_count?.[0]?.count || 0;

                return res.send(response({
                    player_list: playerListData,
                    total_count
                },
                    playerListData.length > 0 ? "Cricket Player list view succesfully.!" : "No data found.!!!", true
                ))
            } else if (params.type == "Football") {
                const footballDbConnection = await connectWithFootballDb();
                const FbPlayersSchema = createFbPlayersModel(footballDbConnection);

                const filter = {};
                if (params.player_name) {
                    filter.fullname = { $regex: params.player_name, $options: "i" };
                }

                let playerList = await FbPlayersSchema.aggregate([
                    { $match: { match_id: params.match_id } },
                    {
                        $lookup: {
                            from: "fb_player_details",
                            localField: "pid",
                            foreignField: "pid",
                            as: "player_detail",
                        },
                    },
                    { $unwind: { path: "$player_detail", preserveNullAndEmptyArrays: true } },
                    ...(filter && filter.fullname
                        ? [{ $match: { "player_detail.fullname": filter.fullname } }]
                        : []
                    ),
                    {
                        $lookup: {
                            from: "fb_players_meta_data",
                            localField: "pid",
                            foreignField: "pid",
                            as: "meta_data",
                        },
                    },
                    { $unwind: { path: "$meta_data", preserveNullAndEmptyArrays: true } },
                    {
                        $group: {
                            _id: "$pid",
                            pid: { $first: "$pid" },
                            fullname: { $first: "$player_detail.fullname" },
                            image_path: { $first: "$player_detail.image_path" },
                            logo_url: { $first: "$meta_data.logo_url" },
                            selectedBy: { $first: "$selectedBy" },
                            jersy_no: { $first: "$meta_data.jersy_no" },
                            avg_point: { $first: "$meta_data.avg_point" },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            pid: 1,
                            fullname: 1,
                            image_path: 1,
                            logo_url: 1,
                            selectedBy: 1,
                            jersy_no: 1,
                            avg_point: 1
                        },
                    },
                    { $sort: { pid: -1 } },
                    {
                        $facet: {
                            data: [{ $skip: startIndex }, { $limit: limit }],
                            total_count: [{ $count: "count" }],
                        },
                    },
                ]);

                let playerListData = playerList?.[0]?.data ?? [];
                let totalCount = playerList?.[0]?.total_count?.[0]?.count || 0;

                let player_list = playerListData.map((itemPly) => ({
                    player_name: itemPly.fullname,
                    rating: "", // Placeholder for future rating field
                    playing_role: itemPly.position_id || "",
                    avg_point: itemPly.avg_point || "",
                    player_image: itemPly.logo_url ? `${env.awsimgurl}profile_doc/${itemPly.logo_url}` : itemPly.image_path,
                    jersy_no: itemPly.jersy_no || "",
                    player_id: itemPly.pid,
                    selectedBy: Boolean(itemPly.selectedBy) || "",
                }));

                return res.send(response({
                    player_list,
                    total_count: totalCount
                },
                    playerListData.length > 0 ? "Football Player list view succesfully.!" : "No data found.!!!", true
                ))
            }
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    update_player: async (req, res) => {
        try {
            let data = req.body;

            if (data.type == "Cricket") {
                const cktDbConnection = await connectWithCricketDb();
                const CktPlayersSchema = createCktPlayersModel(cktDbConnection);

                await CktPlayersSchema.updateOne({ match_id: data.match_id, pid: data.pid }, { $set: { selectedBy: data.selectedBy } })
            } else if (data.type == "Football") {
                const footballDbConnection = await connectWithFootballDb();
                const FbPlayersSchema = createFbPlayersModel(footballDbConnection);

                await FbPlayersSchema.updateOne({ match_id: data.match_id, pid: data.pid }, { $set: { selectedBy: data.selectedBy } })
            }
            return res.send(response({}, `Data created successfully!`, true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },

}