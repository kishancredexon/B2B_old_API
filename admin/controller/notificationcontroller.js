require('dotenv').config(); // env initialize
const response = require("../../helper/response");
var admin = require("firebase-admin");
var fcm = require('fcm-notification');
let sdb = require("../../models");
const { Op } = require('sequelize');
const { connectWithGeneralDb, connectWithVendorDb } = require("../../config/mongodb_connections");
const createNotificationsModel = require("../../mongo_models_new/credexon_general/NotificationsSchema");
const createUsersModel = require("../../mongo_models_new/credexon_vendor/UsersSchema");
const { ObjectId } = require('bson');

const serviceAccount = {
    "type": "service_account",
    "project_id": process.env.project_id,
    "private_key_id": process.env.private_key_id,
    "private_key": process.env.private_key.replace(/\\n/g, '\n'),
    "client_email": process.env.client_email,
    "client_id": process.env.client_id,
    "auth_uri": process.env.auth_uri,
    "token_uri": process.env.token_uri,
    "auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
    "client_x509_cert_url": process.env.client_x509_cert_url
}
const certPath = admin.credential.cert(serviceAccount);
const FCM = new fcm(certPath);
// Import Admin SDK
//const { getDatabase } = require('firebase-admin/database');
// Get a database reference to our blog
//const db = getDatabase();
//const ref = db.ref('/credexon_db');

// Initialize the app with a null auth variable, limiting the server's access
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // The database URL depends on the location of the database
    databaseURL: "https://credexon-a11d3.firebaseapp.com",
    databaseAuthVariableOverride: null
});

// var db = admin.database();
// var ref = db.ref("/credexon_db");
// ref.once("value", function(snapshot) {
// });
module.exports = {
    //Todo: Not using
    send_notification_exipre: async (req, res, next) => {
        const dbName = "crdxn";
        const vendorDbConnection = await connectWithVendorDb(dbName);
        const UsersSchema=createUsersModel(vendorDbConnection);
        try {
            let params = req.body;
            const userDataList = await UsersSchema.find({ is_test: 0, devicetoken: { "$ne": null } }, 
                {'id':"$_id", 'devicetoken':1}).sort({"createdAt":1});
            // const userDataList = await chunkUserList(userList, 5000);
            userDataList.forEach(async (item) => {
                let tokeSting = '';
                //   useritem.forEach(async (item) => { 
                if (item.devicetoken && item.devicetoken !== "null") {
                    if (item.devicetoken && item.devicetoken !== 'BLACKLISTED') {
                        let fcm_token = item.devicetoken;
                        let title = params.title;
                        let body = params.body;
                        let message = {
                            //android: {
                            notification: {
                                title: title,
                                body: body,
                                //icon: 'stock_ticker_update',
                                //},
                                // data : {
                                //     "image": "https://www.gstatic.com/devrel-devsite/prod/ve286fa3f99aa90bc7ef7460968844e5bb93251ce750a58802f281151c87037d6/firebase/images/lockup.svg",
                                //  },
                            },
                            token: fcm_token
                        };
                        FCM.send(message, async function (err, resp) {
                            if (err) {
                                if (err.errorInfo.code == 'messaging/registration-token-not-registered') {
                                    await UsersSchema.updateOne({
                                        _id: ObjectId(item._id)
                                    },{"$set":{
                                        devicetoken: null,
                                        is_test: 1,
                                    }})
                                   
                                }
                                //throw err;
                            } else {
                                await UsersSchema.updateOne({_id: item._id},{is_test: 1})
                                
                            }
                        });
                    }
                }
                //  })
            })
            //await sendPushNotification(fcm_token,title,body)
            return res.send(response({}, `Data created successfully!`, true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    send_notification: async (req, res) => {
        try {
            const generalDbConnection = await connectWithGeneralDb();
            const NotificationsSchema = createNotificationsModel(generalDbConnection);

            const { dbName } = req.user;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UsersSchema = createUsersModel(vendorDbConnection);

            const params = req.body;

            const userFilter = params.userids?.length
                ? { _id: { $in: params.userids } }
                : { devicetoken: { $ne: null } };

            const userList = await UsersSchema.find(userFilter, { id: "$_id", devicetoken: 1 }).sort({ createdAt: -1 });
            const userChunks = chunkUserList(userList, 500);

            for (const userGroup of userChunks) {
                const tokens = [];
                const notificationsToInsert = [];

                for (const user of userGroup) {
                    tokens.push(user.devicetoken);

                    if (params.userids?.length) {
                        notificationsToInsert.push({
                            userid: user._id,
                            type: params.type,
                            title: params.title,
                            body: params.body,
                            isadmin: 1,
                            ...(params.enddate && { enddate: params.enddate }),
                            ...(params.isexpire && { isexpire: params.isexpire }),
                        });
                    }
                }

                // Insert Notifications in Bulk
                if (notificationsToInsert.length) {
                    await NotificationsSchema.insertMany(notificationsToInsert);
                }

                // Send FCM Notifications
                const message = {
                    notification: { title: params.title, body: params.body },
                    token: tokens
                };

                FCM.sendToMultipleToken(message, tokens, async function (err) {
                    if (err) {
                        console.log("FCM Notification Error:", err)
                    } else {
                        console.log('Successfully sent notifications');
                    }
                });
            }

            return res.send(response({}, `Data created successfully!`, true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    //Todo: Not using
    send_notification_stop: async (req, res, next) => {
        try {
            const generalDbConnection = await connectWithGeneralDb();
            const NotificationsSchema = createNotificationsModel(generalDbConnection);

            let db = (await sdb())[global.gdbname[req.user.apikey]];
            let params = req.body;
            let condiUser = (params.userids && params?.userids?.length !== 0) ? {
                where: {
                    id: params.userids
                }
            } : { where: { devicetoken: { [Op.not]: 'null' } }, attributes: ['id', 'devicetoken'] };

            const userList = await db.User.findAll(condiUser);
            const userDataList = await chunkUserList(userList, 200);
            userDataList.forEach(async (useritem) => {
                let tokeSting = '';

                useritem.forEach(async (item) => {
                    let objUsers = {};
                    objUsers["userid"] = item.id;//params.userids;
                    if (params.enddate) {
                        objUsers["enddate"] = params.enddate;
                    }
                    if (params.isexpire) {
                        objUsers["isexpire"] = params.isexpire;
                    }
                    objUsers["type"] = params.type;
                    objUsers["title"] = params.title;
                    objUsers["body"] = params.body;
                    objUsers["isadmin"] = 1;

                    await NotificationsSchema.create(objUsers)
                    if (item.devicetoken && item.devicetoken !== "null") {
                        if (item.devicetoken && item.devicetoken !== 'BLACKLISTED') {
                            let fcm_token = item.devicetoken;
                            let title = params.title;
                            let body = params.body;

                            let message = {
                                //android: {
                                notification: {
                                    title: title,
                                    body: body,
                                    //icon: 'stock_ticker_update',
                                    //},
                                    // data : {
                                    //     "image": "https://www.gstatic.com/devrel-devsite/prod/ve286fa3f99aa90bc7ef7460968844e5bb93251ce750a58802f281151c87037d6/firebase/images/lockup.svg",
                                    //  },
                                },
                                token: fcm_token
                            };

                            FCM.send(message, async function (err, resp) {
                                if (err) {
                                    if (err.errorInfo.code == 'messaging/registration-token-not-registered') {
                                        await db.User.update({
                                            devicetoken: 'null'
                                        }, {
                                            where: {
                                                id: item.id
                                            }
                                        })

                                    }
                                    //throw err;
                                } else {
                                    console.log('Successfully sent notification');
                                }
                            });
                        }
                    }
                })
            })
            //await sendPushNotification(fcm_token,title,body)
            return res.send(response({}, `Data created successfully!`, true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    notification_list: async (req, res) => {
        try {
            const generalDbConnection = await connectWithGeneralDb();
            const NotificationsSchema = createNotificationsModel(generalDbConnection);

            const { page = 1, size = 10 } = req.query;
            const limit = parseInt(size);
            const startIndex = (parseInt(page) - 1) * limit;

            let notifiList = await NotificationsSchema.aggregate([
                {
                    $match: { isadmin: 1 } //Todo: removed this because for admin i think we need to display all the notifications userid: 2 
                },
                { "$sort": { "_id": -1 } },
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

            const totalCount = notifiList?.[0]?.total_count[0]?.count || 0;
            const data = notifiList?.[0]?.data || [];

            return res.send(response(data, "Notification view succesfully.!!!", true, totalCount))

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    //Todo: Not using
    notification_update: async (req, res, next) => {
        try {
            let data = req.body;

            const usersRef = ref.child('users');
            usersRef.update({
                'alanisawesome/nickname': 'Alan The Machine',
                'gracehop/nickname': 'Amazing Grace'
            });
            return res.send(response({}, `Data updated successfully!`, true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    notificationTrigger: async (userids, NotificationTitle, NotificationTitleBody) => {
        const generalDbConnection = await connectWithGeneralDb();
        const NotificationsSchema = createNotificationsModel(generalDbConnection);

        const dbName = "crdxn";
        const vendorDbConnection = await connectWithVendorDb(dbName);
        const UsersSchema=createUsersModel(vendorDbConnection);
        user = await UsersSchema.findOne({
                _id:  ObjectId(userids)
            });
        let objUsers = {};
        objUsers["userid"] = user._id;//params.userids;

        objUsers["type"] = 'promotion';
        objUsers["title"] = NotificationTitle;
        objUsers["body"] = NotificationTitleBody;
        objUsers["isadmin"] = 0;

        await NotificationsSchema.create(objUsers)
        // if(item.devicetoken && item.devicetoken!=="null"){
        if (user.devicetoken && user.devicetoken !== 'BLACKLISTED') {
            let fcm_token = user.devicetoken;
            let title = NotificationTitle;
            let body = NotificationTitleBody;

            let message = {
                //android: {  param
                notification: {
                    title: title,
                    body: body,
                    //icon: 'stock_ticker_update',
                    //},
                    // data : {
                    //     "image": "https://www.gstatic.com/devrel-devsite/prod/ve286fa3f99aa90bc7ef7460968844e5bb93251ce750a58802f281151c87037d6/firebase/images/lockup.svg",
                    //  },
                },
                token: fcm_token
            };

            FCM.send(message, function (err, resp) {
                if (err) {
                    //throw err;
                } else {
                    
                }
            });
        }

    }
}
chunkUserList = (array, chunkSize) => {
    try {
        const size = Math.ceil(array.length / chunkSize)
        const chunks = new Array(size).fill(0);
        return chunks.map((_, index) => {
            const start = index * chunkSize;
            const end = (index + 1) * chunkSize;
            const sliced = array.slice(start, end);
            return sliced;
        })
    } catch (err) {
        //throw err;
    }
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
                //throw err;
            } else {
                // console.log('Successfully sent notification');
            }
        });

    } catch (err) {
        //throw err;
    }
}