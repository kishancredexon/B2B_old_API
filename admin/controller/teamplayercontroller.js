const response = require("../../helper/response");
const env = process.env;
const singleFileRequest = require("../../middleware/files.middleware");
const { connectWithCricketDb, connectWithFootballDb, connectWithVendorDb } = require("../../config/mongodb_connections");
const createCktTeamMetaDataModel = require("../../mongo_models_new/credexon_cricket/CktTeamMetaDataSchema");
const createCktTeamsModel = require("../../mongo_models_new/credexon_cricket/CktTeamsSchema");
const createFbTeamMetaDatasModel = require("../../mongo_models_new/credexon_football/FbTeamMetaDatasSchema");
const createFbTeamsModel = require("../../mongo_models_new/credexon_football/FbTeamsSchema");
const createVendorCktTeamMetaDataModel = require("../../mongo_models_new/credexon_vendor/VendorCktTeamMetaDataSchema");
const config = require("../../config.json");
const createVendorFbTeamMetaDatasModel = require("../../mongo_models_new/credexon_vendor/VendorFbTeamMetaDatasSchema");

module.exports = {
    edit_fb_team: async (req, res) => {

        try {
            const footballDbConnection = await connectWithFootballDb();
            const FbTeamsSchema = createFbTeamsModel(footballDbConnection);

            //new
            let data = req.body;

            let files = req.files;
            let response_array = { status: false, data: {}, message: "Data Not Updated" }
            let where = {};
            let updateArray = {};

            if (data.team_id) { where._id = data.team_id }
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

            await FbTeamsSchema.updateOne({ _id: data.team_id }, { $set: updateArray }).then((result) => {

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
    ckt_team_list: async (req, res) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const CktTeamMetaDataSchema = createCktTeamMetaDataModel(cktDbConnection);
            const CktTeamsSchema = createCktTeamsModel(cktDbConnection);

            let data = req.body;
            let limit = (req.query.page != undefined) ? parseInt(req.query.limit) : 10;
            let page = (req.query.page != undefined) ? parseInt(req.query.page) : 0;
            let skip = page * limit;
            let response_array = { status: false, data: {}, message: "Data Not Found" }

            response_array.data = await CktTeamsSchema.find({}, { team_id: 1, team: 1 }).skip(skip).limit(limit)
            let teamMeta = await CktTeamMetaDataSchema.find({})


            let modifydata = response_array.data.map((item, i) => {

                let checkhttpurl = isValidHttpUrl(item.team.logo_url)
                let send_array = {}
                if (checkhttpurl) {
                    send_array = {
                        _id: item._id,
                        team_id: item.team.tid,
                        title: item.team.title,
                        abbr: item.team.abbr,
                        logo_url: item.team.logo_url,

                    }
                } else {
                    send_array = {
                        _id: item._id,
                        team_id: item.team.tid,
                        title: item.team.title,
                        abbr: item.team.abbr,
                        logo_url: `${env.awsimgurl}profile_doc/${item.team.logo_url}`,
                    }
                }

                return (send_array)

            })


            if (response_array.data.length > 0) { response_array.message = "success" }
            response_array.status = true;
            let total_count = await CktTeamsSchema.count({})
            return res.send(response({
                detail: modifydata,
                total_count: total_count,
            }, "Team find successfully.", true));
            // return res.send({
            //     detail: modifydata,
            //     total_count: total_count,
            // },"team find successfully",true) 
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    ckt_team_find: async (req, res) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const CktTeamsSchema = createCktTeamsModel(cktDbConnection);

            let limit = (req.query.page != undefined) ? parseInt(req.query.limit) : 10;
            let page = (req.query.page != undefined) ? parseInt(req.query.page) : 0;
            let skip = page * limit;
            const params = req.body
            let response_array = { status: false, data: {}, message: "Data Not Found" }

            response_array.data = await CktTeamsSchema.find({
                "team.title": new RegExp(params.name)
            }, { team: 1 }).skip(skip).limit(limit)
            let modifydata = response_array.data.map((item, i) => {

                let checkhttpurl = isValidHttpUrl(item.team.logo_url)
                let send_array = {}
                if (checkhttpurl) {
                    send_array = {
                        _id: item._id,
                        team_id: item.team.tid,
                        title: item.team.title,
                        abbr: item.team.abbr,
                        logo_url: item.team.logo_url,

                    }
                } else {
                    send_array = {
                        _id: item._id,
                        team_id: item.team.tid,
                        title: item.team.title,
                        abbr: item.team.abbr,
                        logo_url: `${env.awsimgurl}profile_doc/${item.team.logo_url}`,
                    }
                }

                return (send_array)

            })

            if (response_array.data.length > 0) { response_array.message = "success" }
            response_array.status = true;
            let total_count = await CktTeamsSchema.count({ "team.title": new RegExp(params.name) })

            return res.send(response({
                detail: modifydata,
                total_count: total_count,
            }, "Team find successfully.", true));
            // return res.send({

            //     detail: modifydata,
            //     total_count: total_count,
            // })
            // return res.send(response({
            //     detail:modifydata,
            //     total_count: total_count,
            // }, "Team find successfully.!!!"))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    edit_ckt: async (req, res) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const CktTeamsSchema = createCktTeamsModel(cktDbConnection);

            const params = req.body

            let where = {
                team_id: (params.team_id)
            }
            let d = await CktTeamsSchema.updateOne(
                { team_id: (params.team_id) }, { $set: params });
            // let c = await cktteam.updateOne(
            //     // title: params.title,
            //     // slug: params.slug,
            //     // content: params.content,
            //     where
            //     ,
            //     { $set: { title: params.title,logo_url:params.logo_url } })

            return res.send(response({ d }, "cms updated succesfully !!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    fb_team_list: async (req, res) => {
        try {
            const footballDbConnection = await connectWithFootballDb();
            const FbTeamsSchema = createFbTeamsModel(footballDbConnection);

            let data = req.query;
            let response_array = { status: false, data: {}, message: "Data Not Found" }
            // let indexvalue = 0;
            // let limit = 10;
            let limit = (req.query.page != undefined) ? parseInt(req.query.limit) : 10;
            let page = (req.query.page != undefined) ? parseInt(req.query.page) : 0;
            let skip = page * limit;

            if (data.indexvalue != undefined) {
                indexvalue = parseInt(data.indexvalue) * limit;
            }

            if (data.limit) { limit = parseInt(data.limit); }
            let detail = await FbTeamsSchema.find({}, { team_id: 1, name: 1, short_code: 1, logo_path: 1, }).skip(skip).limit(limit).lean()
            // .skip(indexvalue).limit(limit)
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
            let total_count = await FbTeamsSchema.count({})

            return res.send(response({
                detail: detail,
                total_count: total_count,
            }, "Team find successfully.", true));
            // return res.send({
            //     ...response_array,
            //     total_count: total_count,
            // }) //({data:response_array.data.ckt_team_list}, "Pool created successfully.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    fb_team_find: async (req, res) => {
        try {
            const footballDbConnection = await connectWithFootballDb();
            const FbTeamsSchema = createFbTeamsModel(footballDbConnection);

            let limit = (req.query.page != undefined) ? parseInt(req.query.limit) : 10;
            let page = (req.query.page != undefined) ? parseInt(req.query.page) : 0;
            let skip = page * limit;
            const params = req.body
            let response_array = { status: false, data: {}, message: "Data Not Found" }

            let detail = await FbTeamsSchema.find({
                name: params.name
                // "team.title": new RegExp(params.name)
            }, { team_id: 1, name: 1, short_code: 1, logo_path: 1, }

            ).skip(skip).limit(limit)


            if (response_array.data.length > 0) { response_array.message = "success" }
            response_array.status = true;
            let total_count = await FbTeamsSchema.count({ name: params.name })

            return res.send(response({
                detail: detail,
                total_count: total_count,
            }, "Team find successfully.", true));
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    edit_ckt_team: async (req, res) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const CktTeamsSchema = createCktTeamsModel(cktDbConnection);

            let data = req.body;

            let files = req.files;
            let response_array = { status: false, data: {}, message: "Data Not Updated" }
            let where = {};
            let updateArray = {};

            if (data.team_id) { where._id = data.team_id }
            if (data.short_code) { updateArray["team.abbr"] = data.short_code; }
            if (data.logo_url) { updateArray["team.logo_url"] = data.logo_url; }
            if (Object.keys(files).length > 0) {
                let files_detail = { files: files, img_name: files.logo_url, folder_name: "profile_doc" }
                let file_name = await singleFileRequest(files_detail);
                updateArray["team.logo_url"] = file_name;
            }
            await CktTeamsSchema.updateOne({ _id: data.team_id }, { $set: updateArray }).then((result) => {

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
    teammeta_upsert: async (req, res) => {
        try {
            let data = req.body;
            let files = req.files;

            data.status = 1;

            if (Object.keys(files).length > 0) {
                let files_detail = { files, img_name: files.logo_url, folder_name: "profile_doc" };
                data.logo_url = await singleFileRequest(files_detail);
            };

            const isVendor = req.user && req.user.dbName && (req.user.usertype === config.role.user);

            const dbConnections = {
                Cricket: { connect: isVendor ? connectWithVendorDb : connectWithCricketDb, model: isVendor ? createVendorCktTeamMetaDataModel : createCktTeamMetaDataModel },
                Football: { connect: isVendor ? connectWithVendorDb : connectWithFootballDb, model: isVendor ? createVendorFbTeamMetaDatasModel : createFbTeamMetaDatasModel }
            };

            if (dbConnections[data.type]) {
                const dbConnection = isVendor ? await dbConnections[data.type].connect(req.user.dbName) : await dbConnections[data.type].connect();
                const TeamMetaDataSchema = dbConnections[data.type].model(dbConnection);
                await TeamMetaDataSchema.updateOne({ team_id: data.team_id }, data, { upsert: true });
            }

            return res.send(response({}, `Team detail is updated successfully`, true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },

    cricket_list: async (req, res) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const CktTeamsSchema = createCktTeamsModel(cktDbConnection);

            const page = parseInt(req.query.page || 1);
            const limit = parseInt(req.query.limit || 10);
            const startIndex = (page - 1) * limit;

            const { name } = req.body;
            const teamnamecondi = name ? { title: new RegExp(name, 'i') } : {};

            const playerList = await CktTeamsSchema.aggregate([
                { $match: teamnamecondi },
                {
                    $lookup: {
                        from: "ckt_team_meta_data",
                        localField: "team_id",
                        foreignField: "team_id",
                        as: "team_detail"
                    }
                },
                { $unwind: { path: "$team_detail", preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: "$team_id",
                        title: { $first: "$title" },
                        short_name: { $first: "$team.abbr" },
                        logo_url: { $first: "$team.logo_url" },
                        logo_url_meta: { $first: "$team_detail.logo_url" },
                        short_name_meta: { $first: "$team_detail.short_name" }
                    }
                },
                { $sort: { title: -1 } },
                {
                    $facet: {
                        data: [{ $skip: startIndex }, { $limit: limit }],
                        total_count: [{ $count: "count" }]
                    }
                }
            ]);

            const playerListData = playerList?.[0]?.data ?? [];
            const dataCount = playerList?.[0]?.total_count?.[0]?.count ?? 0;

            let player_list = playerListData.map(item => ({
                team_id: item._id,
                title: item.title,
                abbr: item.short_name_meta || item.short_name,
                logo_url: item.logo_url_meta ? `${env.awsimgurl}profile_doc/${item.logo_url_meta}` : item.logo_url
            }));

            if (req.user && req.user.dbName && req.user.usertype === config.role.user) {
                const { dbName } = req.user;
                const teamIds = player_list.map(playerDetail => playerDetail.team_id);

                const vendorDbConnection = await connectWithVendorDb(dbName);
                const VendorCktTeamMetaDataSchema = createVendorCktTeamMetaDataModel(vendorDbConnection);

                const players = await VendorCktTeamMetaDataSchema.find({ team_id: { $in: teamIds } }).lean();
                const playersMap = new Map(players.map(player => [player.team_id, player]));

                player_list = player_list.map(player => {
                    const matchedPlayer = playersMap.get(player.team_id);

                    return {
                        ...player,
                        logo_url: matchedPlayer?.logo_url ? `${env.awsimgurl}profile_doc/${matchedPlayer.logo_url}` : player.logo_url,
                        abbr: matchedPlayer?.short_name || player.abbr
                    };
                });
            }

            return res.send(response({
                detail: player_list,
                total_count: dataCount,
            }, "Team find successfully.", true));
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    football_list: async (req, res) => {
        try {
            const footballDbConnection = await connectWithFootballDb();
            const FbTeamsSchema = createFbTeamsModel(footballDbConnection);

            const params = req.body;
            const page = parseInt(req.query.page || 1);
            const limit = parseInt(req.query.limit || 10);
            const startIndex = (page - 1) * limit;

            const teamnamecondi = params.name ? { name: params.name } : {};

            const playerList = await FbTeamsSchema.aggregate([
                { $match: teamnamecondi },
                {
                    $lookup: {
                        from: "fb_team_meta_datas",
                        localField: "team_id",
                        foreignField: "team_id",
                        as: "team_detail",
                    }
                },
                { $unwind: { path: "$team_detail", preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: "$team_id",
                        name: { $first: "$name" },
                        short_code: { $first: "$short_code" },
                        logo_path: { $first: "$logo_path" },
                        logo_url_meta: { $first: "$team_detail.logo_url" },
                        short_name_meta: { $first: "$team_detail.short_name" }
                    }
                },
                { $sort: { name: -1 } },
                {
                    $facet: {
                        data: [{ $skip: startIndex }, { $limit: limit }],
                        total_count: [{ $count: "count" }]
                    }
                }
            ]);

            const playerListData = playerList?.[0]?.data || [];
            const dataCount = playerList?.[0]?.total_count?.[0]?.count || 0;

            let player_list = playerListData.map(itemPly => ({
                team_id: itemPly._id,
                title: itemPly.name,
                abbr: itemPly.short_name_meta || itemPly.short_code,
                logo_url: itemPly.logo_url_meta ? `${env.awsimgurl}profile_doc/${itemPly.logo_url_meta}` : itemPly.logo_path
            }));

            if (req.user && req.user.dbName && req.user.usertype === config.role.user) {
                const { dbName } = req.user;
                const teamIds = player_list.map(playerDetail => playerDetail.team_id);

                const vendorDbConnection = await connectWithVendorDb(dbName);
                const VendorFbTeamMetaDataSchema = createVendorFbTeamMetaDatasModel(vendorDbConnection);

                const players = await VendorFbTeamMetaDataSchema.find({ team_id: { $in: teamIds } }).lean();
                const playersMap = new Map(players.map(player => [player.team_id, player]));

                player_list = player_list.map(player => {
                    const matchedPlayer = playersMap.get(player.team_id);

                    return {
                        ...player,
                        logo_url: matchedPlayer?.logo_url ? `${env.awsimgurl}profile_doc/${matchedPlayer.logo_url}` : player.logo_url,
                        abbr: matchedPlayer?.short_name || player.abbr
                    };
                });
            }

            return res.send(response({
                detail: player_list,
                total_count: dataCount,
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