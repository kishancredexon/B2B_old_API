const response = require("../../helper/response");
const singleFileRequest = require("../../middleware/files.middleware");
const { connectWithCricketDb, connectWithFootballDb, connectWithVendorDb } = require("../../config/mongodb_connections");
const createCktPlayerMetaDataModel = require("../../mongo_models_new/credexon_cricket/CktPlayerMetaDataSchema");
const createFbPlayersMetaDataModel = require("../../mongo_models_new/credexon_football/FbPlayersMetaDataSchema");
const createFbPlayerDetailsModel = require("../../mongo_models_new/credexon_football/FbPlayerDetailsSchema");
const createCktPlayerDetailsModel = require("../../mongo_models_new/credexon_cricket/CktPlayerDetailsSchema");
const createVendorCktPlayerMetaDataModel = require("../../mongo_models_new/credexon_vendor/VendorCktPlayerMetaDataSchema");
const config = require("../../config.json");
const createVendorFbPlayersMetaDataModel = require("../../mongo_models_new/credexon_vendor/VendorFbPlayersMetaDataSchema");

const env = process.env;

module.exports = {

    cktnfbplayer_upsert: async (req, res) => {
        try {
            let data = req.body;
            let files = req.files;

            data.status = 1;

            if (files && Object.keys(files).length > 0) {
                let files_detail = { files, img_name: files.logo_url, folder_name: "profile_doc" };
                data.logo_url = await singleFileRequest(files_detail, req, res);
            }

            const updatePlayerMetadata = async (dbConnection, modelCreator) => {
                const PlayerMetaDataSchema = modelCreator(dbConnection);
                await PlayerMetaDataSchema.updateOne({ pid: data.pid }, data, { upsert: true });
            };

            const isVendor = req.user && req.user.dbName && (req.user.usertype === config.role.user);

            if (data.type === "Cricket") {
                const cktDbConnection = isVendor ? await connectWithVendorDb(req.user.dbName) : await connectWithCricketDb();
                const createCktPlyMetaDataModel = isVendor ? createVendorCktPlayerMetaDataModel : createCktPlayerMetaDataModel;
                await updatePlayerMetadata(cktDbConnection, createCktPlyMetaDataModel);
            } else if (data.type === "Football") {
                const footballDbConnection = isVendor ? await connectWithVendorDb(req.user.dbName) : await connectWithFootballDb();
                const createFbPlyMetaDataModel = isVendor ? createVendorFbPlayersMetaDataModel : createFbPlayersMetaDataModel;
                await updatePlayerMetadata(footballDbConnection, createFbPlyMetaDataModel);
            }

            return res.send(response({}, `Data created successfully!`, true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    cktplayer_delete: async (req, res) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const CktPlayerMetaDataSchema = createCktPlayerMetaDataModel(cktDbConnection);

            const params = req.body
            let response_array = { status: false, data: {}, message: "Data is not Update" }
            let send_array = {}
            if (params.status
            ) {
                send_array.status = params.status
            }
            await CktPlayerMetaDataSchema.updateOne(
                { pid: (params.pid) }, { $set: params });

            response_array.status = true;
            if (params.status == 1) {
                response_array.message = "player active Successfully!!!";
            } else if (params.status == 0) {
                response_array.message = "player inactivate Successfully!!!";
            } else if
                (params.status == 2) {
                response_array.message = "player delete Successfully!!!";
            }
            return res.send(response_array);

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    fbplayer_delete: async (req, res) => {
        try {
            const footballDbConnection = await connectWithFootballDb();
            const FbPlayersMetaDataSchema = createFbPlayersMetaDataModel(footballDbConnection);

            const params = req.body
            let response_array = { status: false, data: {}, message: "Data is not Update" }
            let send_array = {}

            if (params.status) {
                send_array.status = params.status
            }

            await FbPlayersMetaDataSchema.updateOne({ pid: (params.pid) }, { $set: params });

            response_array.status = true;

            if (params.status == 1) {
                response_array.message = "player active Successfully!!!";
            } else if (params.status == 0) {
                response_array.message = "player inactivate Successfully!!!";
            } else if
                (params.status == 2) {
                response_array.message = "player delete Successfully!!!";
            }
            return res.send(response_array);
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    player_list: async (req, res) => {
        try {
            const params = req.body;
            const page = parseInt(req.query.page || 1);
            const limit = parseInt(req.query.limit || 10);
            const skip = (page - 1) * limit;


            if (params.type == "Cricket") {
                const cktDbConnection = await connectWithCricketDb();
                const CktPlayerDetailsSchema = createCktPlayerDetailsModel(cktDbConnection);
                const filter = params.player_name ? { first_name: new RegExp(params.player_name, "i") } : {};

                let playerList = await CktPlayerDetailsSchema.aggregate([
                    { $match: filter },
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
                        $project: {
                            pid: 1,
                            first_name: 1,
                            fantasy_player_rating: 1,
                            bowling_style: 1,
                            batting_style: 1,
                            playing_role: 1,
                            logo_url: "$meta_data.logo_url",
                            jersy_no: "$meta_data.jersy_no"
                        }
                    },
                    { $sort: { pid: -1 } },
                    {
                        $facet: {
                            data: [{ $skip: skip }, { $limit: limit }],
                            total_count: [{ $count: "count" }]
                        }
                    }
                ]);

                const playerListData = playerList?.[0]?.data || [];
                const total_count = playerList?.[0]?.total_count?.[0]?.count || 0;

                let player_list = playerListData.map(item => ({
                    player_id: item.pid,
                    player_name: item.first_name,
                    rating: item.fantasy_player_rating,
                    bowling_style: item.bowling_style,
                    batting_style: item.batting_style,
                    playing_role: item.playing_role,
                    player_image: item.logo_url ? `${env.awsimgurl}profile_doc/${item.logo_url}` : "",
                    jersy_no: item.jersy_no
                }));

                if (req.user && req.user.dbName && req.user.usertype === config.role.user) {
                    const { dbName } = req.user;
                    const pids = player_list.map(playerDetail => playerDetail.player_id);

                    const vendorDbConnection = await connectWithVendorDb(dbName);
                    const VendorCktPlayerMetaDataSchema = createVendorCktPlayerMetaDataModel(vendorDbConnection);

                    const players = await VendorCktPlayerMetaDataSchema.find({ pid: { $in: pids } }).lean();
                    const playersMap = new Map(players.map(player => [player.pid, player]));

                    player_list = player_list.map(player => {
                        const matchedPlayer = playersMap.get(player.player_id);

                        return {
                            ...player,
                            player_image: matchedPlayer?.logo_url ? `${env.awsimgurl}profile_doc/${matchedPlayer.logo_url}` : player.player_image,
                            jersy_no: matchedPlayer?.jersy_no || player.jersy_no
                        };
                    });
                }

                return res.send(response(
                    { player_list, total_count },
                    player_list.length > 0 ? "Cricket Player list retrieved successfully!" : "No data found!",
                    true
                ));

            } else if (params.type === "Football") {
                const footballDbConnection = await connectWithFootballDb();
                const FbPlayerDetailsSchema = createFbPlayerDetailsModel(footballDbConnection);

                const filterFb = params.player_name ? { fullname: new RegExp(params.player_name, "i") } : {};

                const playerList = await FbPlayerDetailsSchema.aggregate([
                    { $match: filterFb },
                    { $sort: { pid: -1 } },
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: "fb_players_meta_data",
                            localField: "pid",
                            foreignField: "pid",
                            as: "player_meta"
                        }
                    },
                    { $unwind: { path: "$player_meta", preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            pid: 1,
                            fullname: 1,
                            image_path: 1,
                            "logo_url": "$player_meta.logo_url",
                            "jersy_no": "$player_meta.jersy_no"
                        }
                    }
                ]);

                const total_count = await FbPlayerDetailsSchema.countDocuments(filterFb);

                let player_list = playerList.map(item => ({
                    player_id: item.pid,
                    player_name: item.fullname,
                    rating: "",//itemPly.rating,
                    playing_role: item.position_id || "",
                    avg_point: "",
                    player_image: item.logo_url ? `${env.awsimgurl}profile_doc/${item.logo_url}` : item.image_path,
                    jersy_no: item.jersy_no
                }));

                if (req.user && req.user.dbName && req.user.usertype === config.role.user) {
                    const { dbName } = req.user;
                    const pids = player_list.map(playerDetail => playerDetail.player_id);

                    const vendorDbConnection = await connectWithVendorDb(dbName);
                    const VendorFbPlayerMetaDataSchema = createVendorFbPlayersMetaDataModel(vendorDbConnection);

                    const players = await VendorFbPlayerMetaDataSchema.find({ pid: { $in: pids } }).lean();
                    const playersMap = new Map(players.map(player => [player.pid, player]));

                    player_list = player_list.map(player => {
                        const matchedPlayer = playersMap.get(player.player_id);

                        return {
                            ...player,
                            player_image: matchedPlayer?.logo_url ? `${env.awsimgurl}profile_doc/${matchedPlayer.logo_url}` : player.player_image,
                            jersy_no: matchedPlayer?.jersy_no || player.jersy_no
                        };
                    });
                }

                return res.send(response(
                    { player_list, total_count },
                    player_list.length > 0 ? "Football Player list retrieved successfully!" : "No data found!",
                    true
                ));
            }
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
}
