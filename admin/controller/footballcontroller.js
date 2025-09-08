const response = require("../../helper/response");
const { dateTimeChange, currentTimeZoneDate } = require("../../helper/common");
const { socketConnection, socket } = require("../../src/view_model/Socket");
const { connectWithFootballDb, connectWithVendorDb } = require("../../config/mongodb_connections");
const createFbUpcomingsModel = require("../../mongo_models_new/credexon_football/FbUpcomingsSchema");
const createUpcomingFootballPublishModel = require("../../mongo_models_new/credexon_vendor/UpcomingFootballSchema");

module.exports = {
    football_list: async (req, res) => {
        try {
            const footballDbConnection = await connectWithFootballDb();
            const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);

            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UpcomingFBPubSchema = createUpcomingFootballPublishModel(vendorDbConnection);

            let limit = (req.query.page != undefined) ? parseInt(req.query.limit) : 10;
            let page = (req.query.page != undefined) ? parseInt(req.query.page) : 0;
            let skip = page * limit;

            let upFb = await UpcomingFBPubSchema.find({ "rstatus": 1, "is_active": 1 }, { "match_id": 1 });
            //new add
            let currentDate = currentTimeZoneDate();
            let football_list = await FbUpcomingsSchema.find({ rstatus: 1, date_start_ist: { $gt: currentDate } },
                {
                    match_id: 1, group_id: 1, league_id: 1, league_name: 1, rstatus: 1, status: 1, teama: 1, teamb: 1, date_end: 1, date_start: 1, date_start_ist: 1, is_placeholder: 1, leg: 1

                }
            ).sort({ date_start_ist: 1 }).skip(skip).limit(limit).exec()


            let total_count = await FbUpcomingsSchema.countDocuments({ rstatus: 1, date_start_ist: { $gt: currentDate } })
            let matchIdArr = [];
            if (upFb?.length > 0) {
                for (let i = 0; i < upFb?.length; i++) {
                    matchIdArr.push(upFb[i]["match_id"]);
                }
            }


            if (matchIdArr?.length > 0 && football_list?.length > 0) {
                for (let i = 0; i < football_list?.length; i++) {
                    football_list[i]["is_active"] = matchIdArr.indexOf(football_list[i]["match_id"]) > -1 ? 1 : 0
                    
                }
            }

            return res.send(response({
                total_count: total_count,
                football_list: football_list,
                status: football_list.length > 0 ? true : false,

            }, football_list.length > 0 ? "Fotball view succesfully.!!!" : "No data found.!!!"))

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    football_activity_list: async (req, res) => {
        try {
            const footballDbConnection = await connectWithFootballDb();
            const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);

            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UpcomingFBPubSchema = createUpcomingFootballPublishModel(vendorDbConnection);

            let limit = (req.query.page != undefined) ? parseInt(req.query.limit) : 10;
            let page = (req.query.page != undefined) ? parseInt(req.query.page) : 0;
            let skip = page * limit;

            let upFb = await UpcomingFBPubSchema.find({ "rstatus": 1, "is_active": 1 }, { "match_id": 1 });
            //new add
            let currentDate = currentTimeZoneDate();
            let football_list = await FbUpcomingsSchema.find({ rstatus: 1, date_start_ist: { $gt: currentDate } },
                {
                    match_id: 1, group_id: 1, league_id: 1, league_name: 1, rstatus: 1, status: 1, teama: 1, teamb: 1, date_end: 1, date_start: 1, date_start_ist: 1, is_placeholder: 1, leg: 1

                }
            ).sort({ date_start_ist: 1 }).skip(skip).limit(limit).exec()


            let total_count = await FbUpcomingsSchema.countDocuments({ rstatus: 1, date_start_ist: { $gt: currentDate } })
            // let matchIdArr = [];
            // if (upFb?.length > 0) {
            //     for (let i = 0; i < upFb?.length; i++) {
            //         matchIdArr.push(upFb[i]["match_id"]);
            //     }
            // }


            // if (matchIdArr?.length > 0 && football_list?.length > 0) {
            //     for (let i = 0; i < football_list?.length; i++) {
            //         football_list[i]["is_active"] = matchIdArr.indexOf(football_list[i]["match_id"]) > -1 ? 1 : 0
            //     }
            // }

            return res.send(response({
                total_count: total_count,
                football_list: football_list,
                status: football_list.length > 0 ? true : false,

            }, football_list.length > 0 ? "Fotball view succesfully.!!!" : "No data found.!!!"))

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    football_active_inactive: async (req, res) => {
        try {
            const params = req.body
            let response_array = { status: false, data: {}, message: "Data is not Update" }

            const footballDbConnection = await connectWithFootballDb();
            const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UpcomingFBPubSchema = createUpcomingFootballPublishModel(vendorDbConnection);

            let upFb = await FbUpcomingsSchema.findOne({ "match_id": params.match_id });

            await UpcomingFBPubSchema.updateOne(
                { match_id: params.match_id },
                { $set: { "is_active": params.is_active, "rstatus": upFb.rstatus, "date_start_ist": upFb.date_start_ist } },
                { upsert: true }
            );

            response_array.status = true;
            if (params.is_active == 1) {
                response_array.message = "Football Active Successfully!!!";
            } else if (params.is_active == 0) {
                response_array.message = "Football Deactive Successfully!!!";
            }
            return res.send(response_array);
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    football_cancel_match: async (req, res) => {
        try {
            const footballDbConnection = await connectWithFootballDb();
            const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);

            const params = req.body
            let response_array = { status: false, data: {}, message: "Data is not Update" }
            //Todo: We can delete this once API will be done
            // let send_array = {}
            // if (params.is_active) {
            //     send_array.r_status = params.is_cancel
            // }
            await FbUpcomingsSchema.updateOne(
                { match_id: params.match_id }, { $set: params });

            response_array.status = true;
            if (params.is_active == 1) {
                response_array.message = "Football Active Successfully!!!";
            } else if (params.is_active == 0) {
                response_array.message = "Football Deactive Successfully!!!";
            }
            return res.send(response_array);
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    football_active_list: async (req, res) => {
        try {
            const footballDbConnection = await connectWithFootballDb();
            const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);

            let limit = (req.query.page != undefined) ? parseInt(req.query.limit) : 10;
            let page = (req.query.page != undefined) ? parseInt(req.query.page) : 0;
            let skip = page * limit;

            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UpcomingFBPubSchema = createUpcomingFootballPublishModel(vendorDbConnection);

            let currentDate = currentTimeZoneDate();
            let upFb = await UpcomingFBPubSchema.find({ "rstatus": 1, "is_active": 1, date_start_ist: { $gt: currentDate } }, { "match_id": 1, "is_publish": 1 })
                .skip(skip)
                .limit(limit)
                .sort({ date_start_ist: -1 });

            let matchIdArr = [];
            let matchIdPublishArr = [];
            if (upFb?.length > 0) {
                for (let i = 0; i < upFb?.length; i++) {
                    matchIdArr.push(upFb[i]["match_id"]);
                    if (upFb[i]["is_publish"] == 1) {
                        matchIdPublishArr.push(upFb[i]["match_id"]);
                    }
                }
            }


            /////////////////////////////////
            let football_list = await FbUpcomingsSchema.find({ "match_id": { "$in": matchIdArr } }, {
                match_id: 1, group_id: 1, is_active: 1, is_publish: 1, league_id: 1, league_name: 1, rstatus: 1, status: 1, teama: 1, teamb: 1, date_end: 1, date_start: 1, date_start_ist: 1
            }).skip(skip).limit(limit).sort({ date_start_ist: 1 }).exec()

            if (matchIdPublishArr?.length > 0 && football_list?.length > 0) {
                for (let i = 0; i < football_list?.length; i++) {
                    football_list[i]["is_publish"] = matchIdPublishArr.indexOf(football_list[i]["match_id"]) > -1 ? 1 : 0
                }
            }

            //count 
            let condition = { "match_id": { "$in": matchIdArr } };
            let total_count = await FbUpcomingsSchema.countDocuments(condition)


            return res.send(response({
                total_count: total_count,
                football_list: football_list,
                status: football_list.length > 0 ? true : false,

            }, football_list.length > 0 ? "Football view succesfully.!!!" : "No data found.!!!"))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    football_publish: async (req, res) => {
        try {
            const footballDbConnection = await connectWithFootballDb();
            const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);

            const params = req.body
            let response_array = { status: false, data: {}, message: "Data is not Update" }

            let apikey = req.user.apikey;

            //Todo: We can delete this once API will be done
            // let send_array = {}
            // let pubkey = "is_publish";
            // send_array[pubkey] = params.is_publish;

            // if (params.is_publish == 1) {
            //     send_array["is_allpublish"] = 1;
            // }
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UpcomingFBPubSchema = createUpcomingFootballPublishModel(vendorDbConnection);

            let upFbVendor = await UpcomingFBPubSchema.updateOne(
                { match_id: params.match_id },
                { $set: { "is_publish": 1 } }
            );

            // Use Mongoose's collection API for direct database interaction
            await FbUpcomingsSchema.updateOne(
                { match_id: params.match_id }, { $set: { "is_allpublish": 1 } });

            if (upFbVendor) {
                socketConnection()
                socket.emit('fix_live_result_match_data_v2', { rstatus: 1, fetch_latest: 1, type: "Football", "cronapikey": apikey });
            }

            response_array.status = true;
            if (params.is_publish == 1) {
                response_array.message = "Football Publish Successfully!!!";
            } else if (params.is_publish == 0) {
                response_array.message = "Football Unpublish Successfully!!!";
            }
            return res.send(response_array);

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    }
}
