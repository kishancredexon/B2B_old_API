const response = require("../../helper/response");
const { generateRandomString } = require("../../helper/randomidgenrate");
const singleFileRequest = require("../../middleware/files.middleware");
const { ObjectId } = require("mongodb");
const { connectWithVendorDb } = require("../../config/mongodb_connections");
const createContestsModel = require("../../mongo_models_new/credexon_vendor/ContestsSchema");
const createPoolMasterModel = require("../../mongo_models_new/credexon_vendor/PoolMasterSchema");

const poolmasterdataFunction = async (data, type, gtype, req) => {

    return new Promise(async (resolve, _) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const PoolMasterSchema = createPoolMasterModel(vendorDbConnection);

            let match = { contest_id: data._id, status: 1, type: type, gtype: gtype };
            await PoolMasterSchema.find(match).then((result) => {
                data.poolAvailable = result.length > 0 ? true : false
                data.totalPool = result.length
                resolve(data)
            }).catch((err) => {
                resolve(err);
            })

        } catch (e) {
            console.log('catch user save classified pages list', e);
        }
    })
}
module.exports = {

    contest_list: async (req, res) => {
        try {
            const dbName = req.user.dbName;

            const vendorDbConnection = await connectWithVendorDb(dbName);
            const ContestsSchema = createContestsModel(vendorDbConnection);

            let limit = (req.query.page) ? parseInt(req.query.limit) : 10;
            let page = (req.query.page) ? parseInt(req.query.page) : 0;
            let skip = page * limit;
            let type = req.query.type
            let gtype = req.query.gtype


            let total_count = await ContestsSchema.countDocuments({ status: { "$in": [0, 1] } });

            await ContestsSchema.find({ status: { "$in": [0, 1] } }).skip(skip).limit(limit).sort({ createdAt: -1 }).lean().then(async (result) => {
                
                let checkpoolData = await Promise.all(result.map(item => poolmasterdataFunction(item, type, gtype, req)))
                return res.send(response({
                    total_count: total_count,
                    contest_list: checkpoolData,
                    status: result.length > 0 ? true : false,

                }, result.length > 0 ? "Contest view succesfully.!!!" : "No data found.!!!"))

            })

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    create_contest: async (req, res) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const ContestsSchema = createContestsModel(vendorDbConnection);

            let response_array = { status: false, message: "Contest Already Created!" };

            let data = req.body;
            let files = req.files;
            let form_datas = {};

            form_datas.title = data.title;
            form_datas.subtitle = data.subtitle;
            form_datas.dis_val = data.dis_val;

            if (await ContestsSchema.findOne({
                title: data.title
            })) {
                return res.send(response_array);

            } else {
                let contest_id = generateRandomString(8);
                form_datas.contest_id = contest_id
                form_datas.status = 0

                await ContestsSchema.create(form_datas).then(async () => {
                    response_array.status = true;
                    response_array.message = "Contest created successfully.!!! ";

                    return res.send(response({ status: "true" }, "Contest created successfully.!!!"))

                });
            }
        }
        catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },


    contest_view: async (req, res) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const ContestsSchema = createContestsModel(vendorDbConnection);

            const params = req.body
            const contestView = await ContestsSchema.findOne({
                contest_id: params.contest_id
                // title: params.title
            })
            return res.send(response(contestView, "Contest find successfully.!!!"))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    contest_update: async (req, res) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const ContestsSchema = createContestsModel(vendorDbConnection);

            let response_array = { status: false, message: "" };

            let data = req.body;
            let files = req.files;
            let form_datas = {};

            form_datas.title = data.title;
            form_datas.subtitle = data.subtitle;
            form_datas.dis_val = data.dis_val;

            if (Object.keys(files).length > 0) {
                let files_detail = { files: files, img_name: files.contestlogo, folder_name: "profile_doc" }
                await singleFileRequest(files_detail);
                var file_name = 'IMG_LOGO_' + Date.now() + '.jpg';
                form_datas.comp_incop_certif_url = file_name;
            } else {
                throw "Upload is required";
            }
            if (await ContestsSchema.findOne({
                title: data.title
            })) {
                return res.send(response_array);
            } else {

                form_datas.status = 2
                await ContestsSchema.updateOne(
                    { contest_id: data.contest_id }, { $set: data });


                return res.send(response({ status: "true" }, "Contest updated successfully.!!!"))

            }
        }
        catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    // contest_update: async (req, res, next) => {
    //     try {

    //         //new chamhgee
    //         let headers = req.headers;


    //             if (Object.keys(files).length > 0) {
    //                 let files_detail = { files: files, img_name: files.contestlogo, folder_name: "profile_doc" }
    //                 await singleFileRequest(files_detail);
    //                 var file_name = 'IMG_LOGO_' + Date.now() + '.jpg';
    //                 form_datas.comp_incop_certif_url = file_name;
    //             } else {
    //                 throw "Upload is required";
    //             }
    //             if (await contestsSchema(req.user.apikey).updateOne(
    //                 { contest_id: data.contest_id }, { $set: data }));
    //             return res.send(response({}, "Contest updated succesfully."))

    //             //new chambe
    //             // const params = req.body
    //             // let contest = await contestsSchema(req.user.apikey).findOne({
    //             //     contest_id: params.contest_id
    //             // });
    //             // // if (contest) {
    //             // //     return res.send(response("Contest already added!!!"))
    //             // //     // return res.send((0), "Contest already added!")
    //             // // }
    //             // await contestsSchema(req.user.apikey).updateOne(
    //             //     { contest_id: params.contest_id }, { $set: params });

    //             // return res.send(response({}, "Contest updated succesfully."))
    //         } catch (error) {
    //             next(error)
    //         }
    //     },
    constest_active: async (req, res) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const ContestsSchema = createContestsModel(vendorDbConnection);

            const params = req.body
            let response_array = { status: "400", data: {}, message: "Data is not Updated" }
            let send_array = {}
            if (params.status) {
                send_array.status = params.status
            }

            await ContestsSchema.updateOne({ _id: ObjectId(params.contest_id) }, { $set: params });
            response_array.status = "200";

            if (params.status == 1) {
                response_array.message = "Contest Active Successfully!!!";
            } else if (params.status == 0) {
                response_array.message = "Contest Deactive Successfully!!!";
            } else if (params.status == 2) {
                response_array.message = "Contest Is Deleted Successfully!!!";
            }
            return res.send(response_array);

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },

    cahnge_constest_order: async (req, res) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const ContestsSchema = createContestsModel(vendorDbConnection);

            const params = req.body
            let response_array = { status: "400", data: {}, message: "Data is not Updated" }
            let send_array = {}

            params.map(item => {
                //Todo: We are not using then statment. We can remove
                ContestsSchema.updateOne({ _id: ObjectId(item.orderId) }, { $set: { order: item.updatedField } });
            });


            // await contestsSchema(req.user.apikey).updateOne({ _id: ObjectId(params.contest_id) }, { $set: params });
            response_array.status = "200";
            response_array.message = "Contest Order Udpated Successfully!!!";
            return res.send(response_array);

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },


    // contest_list: async (req, res, next) => {
    //     try {
    //         // const page = parseInt(req.query.page || 1)
    //         // const limit = parseInt(req.query.limit || 10);
    //         // const startIndex = (page - 1) * limit;
    //         // const endIndex = page * limit;

    //         let limit = (req.query.page != undefined) ? parseInt(req.query.limit) : 10;
    //         let page = (req.query.page != undefined) ?  parseInt(req.query.page) : 0;
    //         let skip = page * limit;

    //         //limit and pagination 
    //         let contest_list = await contestsSchema(req.user.apikey).find().skip(skip).limit(limit);

    //         //count 
    //         let total_count = await contestsSchema(req.user.apikey).find({}).count()

    //         return res.send(response({
    //             total_count: total_count,
    //             contest_list: contest_list,
    //             status: contest_list.length > 0 ? true : false,

    //         }, contest_list.length > 0 ? "Contest view succesfully.!!!" : "No data found.!!!"))



    //     } catch (error) {
    //         return res.send(response({}, "Something went wrong.!!!",false))
    //         //     // return res.send(response(error, "error."))
    //         next(error)
    //     }
    // }
}