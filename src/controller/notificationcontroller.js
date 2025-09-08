const { ObjectId } = require("bson");
const { connectWithGeneralDb, connectWithVendorDb } = require("../../config/mongodb_connections");
const response = require("../../helper/response");
let sdb = require("../../models");
const createNotificationsModel = require("../../mongo_models_new/credexon_general/NotificationsSchema");
const createUsersModel = require("../../mongo_models_new/credexon_vendor/UsersSchema");


module.exports = {
    notification_list: async (req, res, next) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UsersSchema=createUsersModel(vendorDbConnection);
            const generalDbConnection = await connectWithGeneralDb();
            const NotificationsSchema = createNotificationsModel(generalDbConnection);

            let limit = (req.body.page != undefined) ? parseInt(req.body.limit) : 10;
            let page = (req.body.page != undefined) ? parseInt(req.body.page) : 0;
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;

            const userList = await UsersSchema.findOne({_id: ObjectId(req.user.id)});

            console.log("req.user.id--->>", req.user.id);

            let notifiList = await NotificationsSchema.aggregate([
                {
                    $match: { userid: req.user.id, createdAt: { "$gt": userList.createdAt } }
                },
                {
                    $lookup:
                    {
                        from: "notifications_read",
                        localField: "_id",
                        foreignField: "notifid",
                        as: "notify_read",
                    },
                },
                { "$sort": { "_id": -1 } },
                {
                    $facet: {
                        data: [{ $skip: startIndex }],//, { $limit: endIndex }
                        total_count: [
                            {
                                $count: 'count'
                            }
                        ]
                    }
                }

            ])
            let dataCount = (notifiList && notifiList[0] && notifiList[0]["total_count"] && notifiList[0]["total_count"][0] && notifiList[0]["total_count"][0]["count"]) ? notifiList[0]["total_count"][0]["count"] : 0;
            let data = (notifiList && notifiList[0] && notifiList[0]["data"] && notifiList[0]["data"].length > 0) ? notifiList[0]["data"] : [];
            return res.send(response(data, "Notification view succesfully.!!!", true, dataCount))

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    // notification_read:async(req,res,next)=>{
    //     try {
    //         let params = req.body;

    //         let notifiList= await notificationReadSchema.create({"userid":req.user.id,notifid:params.notifid})
    //         return res.send(response({}, `Read successfully!`, true))  
    //     } catch (error) {
    //         return res.status(400).send(response({}, "Something went wrong.!!!", false,null,error.stack));
    //     }
    // }
}

sendPushNotification = (fcm_token, title, body) => {
    try {

        let message = {
            android: {
                notification: {
                    title: title,
                    body: body,
                },
            },
            token: fcm_token
        };

        FCM.send(message, function (err, resp) {
            if (err) {
                throw err;
            } else {
                console.log('Successfully sent notification');
            }
        });

    } catch (err) {
        throw err;
    }
}