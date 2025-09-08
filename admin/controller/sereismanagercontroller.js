const response = require("../../helper/response");
const singleFileRequest = require("../../middleware/files.middleware");
const { connectWithCricketDb, connectWithFootballDb } = require("../../config/mongodb_connections");
const createCktLeaguesModel = require("../../mongo_models_new/credexon_cricket/CktLeaguesSchema");
const createCktSeriesMetaDataModel = require("../../mongo_models_new/credexon_cricket/CktSeriesMetaDataSchema");
const createFbSeriesMetaDatasModel = require("../../mongo_models_new/credexon_football/FbSeriesMetaDatasSchema");
const createFbLeaguesModel = require("../../mongo_models_new/credexon_football/FbLeaguesSchema");
const createFbTeamsModel = require("../../mongo_models_new/credexon_football/FbTeamsSchema");
const env = process.env;

module.exports = {
    sereis_ckt_team_list: async (req, res, next) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);

            let params = req.body;
            let limit = (req.query.page != undefined) ? parseInt(req.query.limit) : 10;
            let page = (req.query.page != undefined) ? parseInt(req.query.page) : 0;
            let skip = page * limit;

            let team_list = await CktLeaguesSchema.find({}, { _id: 1, cid: 1, abbr: 1, category: 1, name: 1, status: 1, logo_url: 1 }).skip(skip).limit(limit).lean();

            team_list = team_list.map((item, i) => {
                if (item.logo_url) {
                    item.logo_url = `${env.awsimgurl}profile_doc/${item.logo_url}`
                } else {
                    item.logo_url = ""
                }
                return (item)
            })

            let total_count = await CktLeaguesSchema.count({});

            return res.send(response({
                detail: team_list,
                total_count: total_count,
            }, "Team find successfully.", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    sereis_ckt_team_find: async (req, res, next) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);

            let params = req.body;
            let limit = (req.query.page != undefined) ? parseInt(req.query.limit) : 10;
            let page = (req.query.page != undefined) ? parseInt(req.query.page) : 0;
            let skip = page * limit;

            let team_list = await CktLeaguesSchema.find({ name: params.name },
                { _id: 1, cid: 1, abbr: 1, category: 1, name: 1, status: 1, logo_url: 1 }
            ).skip(skip).limit(limit).lean();

            team_list = team_list.map((item, i) => {

                if (item.logo_url) {
                    item.logo_url = `${env.awsimgurl}profile_doc/${item.logo_url}`
                } else {
                    item.logo_url = ""
                }
                return (item)
            });

            let total_count = await CktLeaguesSchema.count({ name: params.name });

            return res.send(response({
                detail: team_list,
                total_count: total_count,
            }, "Team find successfully.", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    sereis_edit_ckt: async (req, res, next) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);

            let data = req.body;

            let files = req.files;
            let response_array = { status: false, data: {}, message: "Data Not Updated" }
            let where = {};
            let updateArray = {};

            if (data.team_id) {
                where._id = data.team_id
            }

            if (data.short_code) {
                updateArray["abbr"] = data.short_code;
            }

            if (data.logo_url) {
                updateArray["logo_url"] = data.logo_url;
            }

            if (Object.keys(files).length > 0) {
                let files_detail = { files: files, img_name: files.logo_url, folder_name: "profile_doc" }
                let file_name = await singleFileRequest(files_detail);
                updateArray["logo_url"] = file_name;
            }

            await CktLeaguesSchema.updateOne({ _id: data.team_id }, { $set: updateArray }, { "upsert": true }).then((result) => {

                if (result.n == 1) {
                    response_array.status = true;
                    response_array.message = "Updated Successfull";
                }
                else {
                    response_array.status = false;
                    response_array.message = "Not Successfull";
                }
            })

            return res.send(response_array)
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    sereis_fb_team_list: async (req, res, next) => {
        try {
            const footballDbConnection = await connectWithFootballDb();
            const FbLeaguesSchema = createFbLeaguesModel(footballDbConnection);

            let data = req.query;
            let response_array = { status: false, data: {}, message: "Data Not Found" }
            let limit = (req.query.page != undefined) ? parseInt(req.query.limit) : 10;
            let page = (req.query.page != undefined) ? parseInt(req.query.page) : 0;
            let skip = page * limit;


            let detail = await FbLeaguesSchema.find({},
                { _id: 1, season_id: 1, name: 1, short_code: 1, logo_path: 1, }
            ).skip(skip).limit(limit).lean();

            detail = detail.map((item, i) => {

                let checkhttpurl = isValidHttpUrl(item.logo_path)

                if (checkhttpurl) {
                    item.logo_path = item.logo_path
                } else {
                    item.logo_path = `${env.awsimgurl}profile_doc/${item.logo_path}`
                }

                return (item)
            })

            if (response_array.data.length > 0) { response_array.message = "success" }
            response_array.status = true;
            let total_count = await FbLeaguesSchema.count({})

            return res.send(response({
                detail: detail,
                total_count: total_count,
            }, "Team find successfully.", true));

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    sereis_fb_team_find: async (req, res, next) => {
        try {
            const footballDbConnection = await connectWithFootballDb();
            const FbLeaguesSchema = createFbLeaguesModel(footballDbConnection);

            //let data = req.query;
            let params = req.body
            let response_array = { status: false, data: {}, message: "Data Not Found" }
            let limit = (req.query.page != undefined) ? parseInt(req.query.limit) : 10;
            let page = (req.query.page != undefined) ? parseInt(req.query.page) : 0;
            let skip = page * limit;

            let detail = await FbLeaguesSchema.find({ name: params.name },
                { _id: 1, season_id: 1, name: 1, short_code: 1, logo_path: 1, }
            ).skip(skip).limit(limit).lean()

            detail = detail.map((item, i) => {
                let checkhttpurl = isValidHttpUrl(item.logo_path)
                if (checkhttpurl) {
                    item.logo_path = item.logo_path
                } else {
                    item.logo_path = `${env.awsimgurl}profile_doc/${item.logo_path}`
                }
                return (item)
            })

            if (response_array.data.length > 0) { response_array.message = "success" }
            response_array.status = true;
            let total_count = await FbLeaguesSchema.count({ name: params.name })

            return res.send(response({
                detail: detail, total_count: total_count,
            }, "Team find successfully.", true));

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    sereis_edit_fb: async (req, res, next) => {
        try {
            const footballDbConnection = await connectWithFootballDb();
            const FbLeaguesSchema = createFbLeaguesModel(footballDbConnection);
            const FbTeamsSchema = createFbTeamsModel(footballDbConnection);

            let data = req.body;
            let files = req.files;
            let response_array = { status: false, data: {}, message: "Data Not Updated" }
            let where = {};
            let updateArray = {};

            if (data.team_id) {
                where._id = data.team_id
            }
            if (data.short_code) {
                updateArray.short_code = data.short_code;
            }
            if (data.logo_path) {
                updateArray.logo_path = data.logo_path;
            }

            if (Object.keys(files).length > 0) {
                let files_detail = { files: files, img_name: files.logo_path, folder_name: "profile_doc" }
                let file_name = await singleFileRequest(files_detail);
                updateArray.logo_path = file_name;
            }

            let c = await FbLeaguesSchema.updateOne({ _id: data.team_id }, { $set: updateArray }, { "upsert": true }).then((result) => {

                if (result.n == 1) {
                    response_array.status = true;
                    response_array.message = "Updated Successfull";
                }
                else {
                    response_array.status = FbTeamsSchema;
                    response_array.message = "Not Successfull";
                }
            })

            return res.send(response_array)

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    teamseriesmetadata_upsert: async (req, res) => {
        try {
            let data = req.body;
            let files = req.files;

            data.status = 1;

            let dbConnection, SeriesMetaDataSchema;

            if (data.type === "Cricket") {
                dbConnection = await connectWithCricketDb();
                SeriesMetaDataSchema = createCktSeriesMetaDataModel(dbConnection);
            } else if (data.type === "Football") {
                dbConnection = await connectWithFootballDb();
                SeriesMetaDataSchema = createFbSeriesMetaDatasModel(dbConnection);
            }

            if (files && Object.keys(files).length > 0) {
                let fileDetails = { files, img_name: files.logo_url, folder_name: "profile_doc" };
                data.logo_url = await singleFileRequest(fileDetails);
            }

            await SeriesMetaDataSchema.updateOne({ league_id: data.league_id }, data, { upsert: true });

            return res.send(response({}, `Data created successfully!`, true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    cricket_list: async (req, res) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const CktLeaguesSchema = createCktLeaguesModel(cktDbConnection);

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const params = req.body;

            const matchCondition = params.name ? { name: params.name } : {};

            let playerList = await CktLeaguesSchema.aggregate([
                { $match: matchCondition },
                {
                    $lookup: {
                        from: "ckt_series_meta_data",
                        localField: "cid",
                        foreignField: "league_id",
                        as: "team_detail"
                    }
                },
                { $unwind: { path: "$team_detail", preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: "$cid",
                        name: { $first: "$name" },
                        short_name: { $first: "$abbr" },
                        category: { $first: "$category" },
                        status: { $first: "$status" },
                        logo_url_meta: { $first: "$team_detail.logo_url" },
                        short_name_meta: { $first: "$team_detail.short_name" }
                    }
                },
                { $sort: { name: -1 } },
                {
                    $facet: {
                        data: [{ $skip: skip }, { $limit: limit }], // Pagination
                        total_count: [{ $count: "count" }] // Count total documents
                    }
                }
            ]);

            const playerListData = playerList?.[0]?.data ?? [];
            const totalCount = playerList?.[0]?.total_count?.[0]?.count ?? 0;

            const player_list = playerListData.map(item => ({
                cid: item._id,
                name: item.name,
                abbr: item.short_name_meta || item.short_name,
                category: item.category,
                status: item.status,
                logo_url: item.logo_url_meta ? `${env.awsimgurl}profile_doc/${item.logo_url_meta}` : ""
            }));

            return res.send(response({
                detail: player_list,
                total_count: totalCount,
            }, "Team find successfully.", true));
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    football_list: async (req, res) => {
        try {
            const footballDbConnection = await connectWithFootballDb();
            const FbLeaguesSchema = createFbLeaguesModel(footballDbConnection);

            const { name } = req.body;
            const page = parseInt(req.query.page || 1);
            const limit = parseInt(req.query.limit || 10);
            const startIndex = (page - 1) * limit;

            const teamnamecondi = name ? { name: { $regex: new RegExp(name, "i") } } : {};

            const playerList = await FbLeaguesSchema.aggregate([
                { $match: teamnamecondi },
                {
                    $lookup: {
                        from: "fb_series_meta_datas",
                        localField: "season_id",
                        foreignField: "league_id",
                        as: "team_detail",
                    },
                },
                { $unwind: { path: "$team_detail", preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: { season_id: "$season_id" },
                        name: { $first: "$name" },
                        short_code: { $first: "$short_code" },
                        logo_path: { $first: "$logo_path" },
                        logo_url_meta: { $first: "$team_detail.logo_url" },
                        short_name_meta: { $first: "$team_detail.short_name" },
                    },
                },
                { $sort: { name: -1 } },
                {
                    $facet: {
                        data: [{ $skip: startIndex }, { $limit: limit }],
                        total_count: [{ $count: "count" }],
                    },
                },
            ]);

            const playerListData = playerList?.[0]?.data || [];
            const totalCount = playerList?.[0]?.total_count?.[0]?.count || 0;

            const formattedPlayerList = playerListData.map(({ _id, name, short_code, short_name_meta, logo_path, logo_url_meta }) => ({
                season_id: _id.season_id,
                name,
                short_code: short_name_meta || short_code,
                logo_path: logo_url_meta ? `${env.awsimgurl}profile_doc/${logo_url_meta}` : logo_path,
            }));

            return res.send(response({
                detail: formattedPlayerList,
                total_count: totalCount,
            }, "Team find successfully.", true));
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    }
}


const isValidHttpUrl = (string) => {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}