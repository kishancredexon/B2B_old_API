let sdb = require("../../models");
const response = require("../../helper/response");
const config = require("../../config.json");
const { Sequelize, Op } = require('sequelize');
const moment = require("moment")
const { connectWithVendorDb, connectWithGeneralDb, connectWithMasterDb } = require("../../config/mongodb_connections");
const createContestsModel = require("../../mongo_models_new/credexon_vendor/ContestsSchema");
const createDownloadsModel = require("../../mongo_models_new/credexon_vendor/DownloadsSchema");
const createUsersModel = require("../../mongo_models_new/credexon_vendor/UsersSchema");
const createTransactionsModel = require("../../mongo_models_new/credexon_vendor/TransactionsSchema");
const createMasterUsersModel = require("../../mongo_models_new/credexon_master/MasterUsersSchema");
const { ObjectID } = require("bson");

module.exports = {
    dashbord_list: async (req, res, next) => {
        try {
            
            // Establishing Database Connections
            const generalDbConnection = await connectWithGeneralDb();
            const DownloadsSchema = createDownloadsModel(generalDbConnection);

            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const ContestsSchema = createContestsModel(vendorDbConnection);
            const UsersSchema = createUsersModel(vendorDbConnection);
            const TransactionsSchema = createTransactionsModel(vendorDbConnection);

            const todayStart = moment().startOf("day").toDate();
            const weekStart = moment().subtract(7, "days").toDate();
            const monthStart = moment().subtract(30, "days").toDate();

            //Todo: i don't think we need to find this by userType because we are finding users on vendor level same for below
            const results = await UsersSchema.aggregate([
                {
                    $facet: {
                        totalRegistrations: [
                            { $match: { usertype: config.role.user } },
                            { $count: "count" }
                        ],
                        totalCompleteKYC: [
                            { $match: { usertype: config.role.user, status: 1 } },
                            { $count: "count" }
                        ],
                        totalIncompleteKYC: [
                            { $match: { usertype: config.role.user, isbankdverify: 2 } },
                            { $count: "count" }
                        ],
                        signupCount: [
                            {
                                $match: {
                                    usertype: config.role.user,
                                    createdAt: { $gte: todayStart }
                                }
                            },
                            { $count: "count" }
                        ]
                    }
                }
            ]);

            const totalRegistrationsCount = results[0].totalRegistrations[0]?.count || 0;
            const totalCompleteKYCCount = results[0].totalCompleteKYC[0]?.count || 0;
            const totalIncompleteKYCCount = results[0].totalIncompleteKYC[0]?.count || 0;
            const signupCount = results[0].signupCount[0]?.count || 0;

            // **🔥 Contest Counts**
            const contestStats = await ContestsSchema.aggregate([
                {
                    $facet: {
                        create_contest_count: [{ $match: { status: { $in: [0, 1] } } }, { $count: "count" }],
                        active_contest_count: [{ $match: { status: 1 } }, { $count: "count" }],
                        inactive_contest_count: [{ $match: { status: 0 } }, { $count: "count" }]
                    }
                }
            ]);

            const create_contest_count = contestStats[0].create_contest_count[0]?.count || 0;
            const active_contest_count = contestStats[0].active_contest_count[0]?.count || 0;
            const inactive_contest_count = contestStats[0].inactive_contest_count[0]?.count || 0;

            // **🔥 Transaction Counts**
            const transactionStats = await TransactionsSchema.aggregate([
                {
                    $facet: {
                        Total_withdrawal_request_count: [
                            { $match: { atype: "bal_wtd_req" } },
                            { $count: "count" }
                        ],
                        Total_withdraw_requests_today_count: [
                            { $match: { atype: "bal_wtd_req", createdAt: { $gte: todayStart } } },
                            { $count: "count" }
                        ],
                        Total_withdraw_requests_weekly_count: [
                            { $match: { atype: "bal_wtd_req", createdAt: { $gte: weekStart } } },
                            { $count: "count" }
                        ],
                        Total_withdraw_requests_monthly_count: [
                            { $match: { atype: "bal_wtd_req", createdAt: { $gte: monthStart } } },
                            { $count: "count" }
                        ]
                    }
                }
            ]);

            const Total_withdrawal_request_count = transactionStats[0].Total_withdrawal_request_count[0]?.count || 0;
            const Total_withdraw_requests_today_count = transactionStats[0].Total_withdraw_requests_today_count[0]?.count || 0;
            const Total_withdraw_requests_weekly_count = transactionStats[0].Total_withdraw_requests_weekly_count[0]?.count || 0;
            const Total_withdraw_requests_monthly_count = transactionStats[0].Total_withdraw_requests_monthly_count[0]?.count || 0;

            // **🔥 User Geographical Stats**
            const india_users = await UsersSchema.countDocuments({ country_code: "+91" });
            const uk_users = await UsersSchema.countDocuments({ country_code: "+44" });

            // **🔥 Device-wise User Signup Stats**
            const Total_signup_user_device_count = await UsersSchema.countDocuments({
                usertype: config.role.user,
                devicetype: { $in: ["android", "ios"] }
            });

            const Total_signup_user_web_count = await UsersSchema.countDocuments({
                usertype: config.role.user,
                devicetype: { $nin: ["android", "ios"] }
            });

            // **🔥 Total Installation Count**
            //Todo: do we need to display downloads according to the vendor because we are displaying this for admin and vendor
            let Total_installation = await DownloadsSchema.aggregate([
                {
                    "$match": {
                        "os": "Android",
                        "userid": { "$ne": null }
                    }
                },
                {
                    "$group": {
                        _id: null,
                        "clientkey": { "$first": "$clientkey" },
                        "install": { "$sum": 1 }
                    }
                },
                {
                    "$sort": { "clientkey": 1 }
                }
            ]);

            const Total_installation_count = Total_installation?.map((item) => {
                const key = item?.install;
                return key
            })

            // **Transactions Aggregation**
            const transactionCounts = await TransactionsSchema.aggregate([
                {
                    $facet: {
                        totalFirstDeposit: [
                            { $match: { trans_status: "PAYMENT_SUCCESS" } },
                            { $group: { _id: "$userid", count: { $sum: 1 } } },
                            { $match: { count: 1 } },
                            { $count: "total" }
                        ],
                        totalRepeatingDeposit: [
                            { $match: { trans_status: "PAYMENT_SUCCESS" } },
                            { $group: { _id: "$userid", count: { $sum: 1 } } },
                            { $match: { count: { $gt: 1 } } },
                            { $count: "total" }
                        ],
                        totalDepositToday: [
                            { $match: { trans_status: "PAYMENT_SUCCESS", createdAt: { $gte: todayStart } } },
                            { $count: "count" }
                        ],
                        totalDepositAmountToday: [
                            { $match: { trans_status: "PAYMENT_SUCCESS", createdAt: { $gte: todayStart } } },
                            { $group: { _id: null, total: { $sum: "$amount" } } }
                        ],
                        totalDepositWeekly: [
                            { $match: { trans_status: "PAYMENT_SUCCESS", createdAt: { $gte: weekStart } } },
                            { $count: "count" }
                        ],
                        totalDepositMonthly: [
                            { $match: { trans_status: "PAYMENT_SUCCESS", createdAt: { $gte: monthStart } } },
                            { $count: "count" }
                        ]
                    }
                }
            ]);


            const Total_first_deposit_count = transactionCounts[0].totalFirstDeposit[0]?.total || 0;
            const Total_repeating_deposit_count = transactionCounts[0].totalRepeatingDeposit[0]?.total || 0;
            const Total_deposit_requests_today_count = transactionCounts[0].totalDepositToday[0]?.count || 0;
            const Total_deposit_requests_weekly_count = transactionCounts[0].totalDepositWeekly[0]?.count || 0;
            const Total_deposit_requests_monthly_count = transactionCounts[0].totalDepositMonthly[0]?.count || 0;
            const Total_deposit_amount_today = transactionCounts[0].totalDepositAmountToday[0]?.total || 0;

            // **Users Aggregation - Active Users**
            const Active_user_count = await UsersSchema.countDocuments({ totaljoinfee: { $gt: 0 } });

            // **Device-based User Signups (iOS, Android, Web)**
            const formatter = new Intl.DateTimeFormat("en", { month: "long", })
            const formatKey = date => formatter.format(date).replace(" ", "-")


            const generateMonthTemplate = () => {
                const months = {};
                const dateStart = moment();
                const dateEnd = moment().add(11, "months");
                while (dateEnd.diff(dateStart, "months") >= 0) {
                    months[dateStart.format("MMMM")] = 0;
                    dateStart.add(1, "month");
                }
                return months;
            };

            const monthTemplate = generateMonthTemplate();

            const getOrdersPerMonth = async (deviceType) => {
                const orders = await UsersSchema.find(
                    { usertype: config.role.user, devicetype: deviceType },
                    { createdAt: 1, _id: 0 }
                );

                // Count orders per month
                const counts = orders.reduce((acc, { createdAt }) => {
                    const key = formatKey(createdAt);
                    acc[key] = (acc[key] || 0) + 1;
                    return acc;
                }, {});

                return { ...monthTemplate, ...counts };
            }

            const [iosData, androidData, webData] = await Promise.all([
                getOrdersPerMonth("ios"),
                getOrdersPerMonth("android"),
                getOrdersPerMonth(null)
            ]);

            const visitior = []
            visitior.push({ iosObject: iosData })
            visitior.push({ androidObject: androidData })
            visitior.push({ webObject: webData })

            return res.send(response({
                Active_user_count: Active_user_count,
                Total_registrations_count: totalRegistrationsCount,//Todo: i think we should change the key
                signup_count: signupCount,
                create_contest_count: create_contest_count,
                active_contest_count: active_contest_count,
                inactive_contest_count: inactive_contest_count,
                Total_withdrawal_request_count: Total_withdrawal_request_count,
                Total_withdraw_requests_today_count: Total_withdraw_requests_today_count,
                india_users: india_users,
                uk_users: uk_users,
                visitior: visitior,
                Total_complate_KYC_count: totalCompleteKYCCount,
                Total_incomplate_KYC_count: totalIncompleteKYCCount,
                Total_first_deposit_count: Total_first_deposit_count.length,
                Total_repeating_deposit_count: Total_repeating_deposit_count.length,
                Total_signup_user_web_count: Total_signup_user_web_count,
                Total_signup_user_device_count: Total_signup_user_device_count,
                Total_withdraw_requests_weekly_count: Total_withdraw_requests_weekly_count,
                Total_withdraw_requests_monthly_count: Total_withdraw_requests_monthly_count,
                Total_installation_count: Total_installation_count,
                Total_deposit_requests_today_count: Total_deposit_requests_today_count,
                Total_deposit_requests_weekly_count: Total_deposit_requests_weekly_count,
                Total_deposit_requests_monthly_count: Total_deposit_requests_monthly_count,
                Total_deposit_amount_today: Total_deposit_amount_today,

            }, "Data found succesfully.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    //Todo: We can remove this after completing the new code
    dashbord_list_old: async (req, res, next) => {
        const generalDbConnection = await connectWithGeneralDb();
        const DownloadsSchema = createDownloadsModel(generalDbConnection);

        const dbName = req.user.dbName;
        const vendorDbConnection = await connectWithVendorDb(dbName);
        const ContestsSchema = createContestsModel(vendorDbConnection);

        let db = (await sdb())[global.gdbname[req.user.apikey]];
        try {
            let Total_registrations_count = await db.User.countDocuments({
                where: {
                    usertype: [config.role.user]
                },
            });

            let Total_complate_KYC_count = await db.User.count({
                where: {
                    usertype: [config.role.user],
                    status: 1
                },
            });
            let Total_incomplate_KYC_count = await db.User.count({
                where: {
                    usertype: [config.role.user],
                    isbankdverify: 2
                },
            });

            let times = moment().format("YYYY-MM-DD 00:00:00")
            let signup_count = await db.User.count({
                where: {
                    usertype: [config.role.user],
                    createdAt: {
                        [Op.gte]: times
                    },
                },
            })

            let create_contest_count = await ContestsSchema.countDocuments({ status: { "$in": [0, 1] } })

            let active_contest_count = await ContestsSchema.countDocuments({ status: 1 })

            let inactive_contest_count = await ContestsSchema.countDocuments({ status: 0 })

            let Total_withdrawal_request_count = await db.Transactions.count({ where: { atype: "bal_wtd_req" } })

            //let Total_first_deposit_count = await db.Transactions.count({ where: { trans_status: "PAYMENT_SUCCESS" } })



            let Total_first_deposit_count = await db.Transactions.findAll(
                {
                    where: { trans_status: "PAYMENT_SUCCESS" },

                    attributes: [
                        [Sequelize.literal('SUM(1)'), 'total_user'],
                        'userid',
                    ],
                    group: ['userid'], // Group by category
                    having: Sequelize.literal('SUM(1) = 1'),
                })

            let Active_user_count = await db.User.count({
                where: {
                    totaljoinfee: {
                        [Op.gt]: 0
                    },
                },
            })

            let Total_installation = await DownloadsSchema.aggregate([

                ([{ "$match": { "os": "Android", "userid": { "$ne": null } } },
                { "$group": { _id: null, "clientkey": { "$first": "$clientkey" }, "install": { "$sum": 1 } } },
                { "$sort": { "clientkey": 1 } }])
            ]);
            const Total_installation_count = Total_installation?.map((item) => {

                const key = item?.install;
                return key
            })

            let Total_repeating_deposit_count = await db.Transactions.findAll(
                {
                    where: { trans_status: "PAYMENT_SUCCESS" },

                    attributes: [
                        [Sequelize.literal('SUM(1)'), 'total_user'],
                        'userid',
                    ],
                    group: ['userid'], // Group by category
                    having: Sequelize.literal('SUM(1) > 1'),
                })

            let Total_withdraw_requests_today_count = await db.Transactions.count({
                where: {
                    atype: "bal_wtd_req", createdAt: {
                        [Op.gte]: times
                    },
                }
            })



            let Total_withdraw_requests_weekly_count = await db.Transactions.count({
                where: {
                    atype: "bal_wtd_req", createdAt: {
                        [Op.gte]: moment().subtract(7, 'days').toDate()
                    },
                }
            })

            let Total_withdraw_requests_monthly_count = await db.Transactions.count({
                where: {
                    atype: "bal_wtd_req", createdAt: {
                        [Op.gte]: moment().subtract(30, 'days').toDate()
                    },
                }
            })
            let india_users = await db.User.count({ where: { country_code: "+91" } })

            let uk_users = await db.User.count({ where: { country_code: "+44" } })


            //ios
            const formatter = new Intl.DateTimeFormat("en", {
                // year: "2-digit",
                month: "long",
            })

            const formatKey = date => formatter.format(date).replace(" ", "-")

            var orders = await db.User.findAll({
                where: {
                    usertype: [config.role.user],
                    devicetype: "ios"
                },
                attributes: ['createdAt']
            });


            const months = () => {
                var updatedMonthObj = {}
                const months = []
                const dateStart = moment()
                const dateEnd = moment().add(11, "month")
                while (dateEnd.diff(dateStart, "months") >= 0) {
                    Object.assign(updatedMonthObj, { [dateStart.format("MMMM")]: 0 })
                    dateStart.add(1, "month")
                }
                return updatedMonthObj

            }

            //ios
            const ordersPerMonth = orders?.map((item) => {
                const key = formatKey(item?.dataValues?.createdAt).replace(" ", "-")
                return key
            })
            const counts = ordersPerMonth.reduce((acc, value) => ({
                ...acc,
                [value]: (acc[value] || 0) + 1
            }), {});
            const finalMonthsIos = { ...months(), ...counts };



            //web
            var orders_web = await db.User.findAll({
                where: {
                    usertype: [config.role.user],
                    devicetype: null
                },
                attributes: ['createdAt']
            });
            const ordersPerMonth_web = orders_web?.map((item) => {
                const key = formatKey(item?.dataValues?.createdAt).replace(" ", "-")
                return key
            })
            const counts_web = ordersPerMonth_web.reduce((acc, value) => ({
                ...acc,
                [value]: (acc[value] || 0) + 1
            }), {});
            const finalMonthsWeb = { ...months(), ...counts_web };

            //android
            var orders_android = await db.User.findAll({
                where: {
                    usertype: [config.role.user],
                    devicetype: "android"
                },
                attributes: ['createdAt']
            });


            const ordersPerMonth_android = orders_android?.map((item) => {
                const key = formatKey(item?.dataValues?.createdAt).replace(" ", "-")
                return key
            })
            const counts_android = ordersPerMonth_android.reduce((acc, value) => ({
                ...acc,
                [value]: (acc[value] || 0) + 1
            }), {});
            const finalMonthsandroid = { ...months(), ...counts_android };

            let visitior = []
            visitior.push({ iosObject: finalMonthsIos })
            visitior.push({ androidObject: finalMonthsWeb })
            visitior.push({ webObject: finalMonthsandroid })





            let Total_signup_user_device_count = await db.User.count({
                where: {
                    usertype: [config.role.user],
                    devicetype: { [Op.or]: ['android', 'ios'] }

                },
            })


            let Total_signup_user_web_count = await db.User.count({
                where: {
                    usertype: [config.role.user],
                    devicetype: { [Op.notIn]: ['android', 'ios'] }

                },
            })
            const tomorrow = moment().add(1, 'days');
            var dateTime = moment();
            var dateValue = moment({
                year: dateTime.year(),
                month: dateTime.month(),
                day: dateTime.date()
            });

            let Total_deposit_requests_today_count = await db.Transactions.count({
                where: {
                    trans_status: "PAYMENT_SUCCESS", createdAt: {
                        [Op.gte]: dateValue
                    },
                }
            })

            let Total_deposit_amount = await db.Transactions.findAll(
                {
                    where: {
                        trans_status: "PAYMENT_SUCCESS",
                        createdAt: {
                            [Op.gte]: dateValue
                        }

                    },
                    attributes: [
                        [Sequelize.literal('SUM(amount)'), 'total_amount']
                    ]
                })

            const Total_deposit_amount_today = Total_deposit_amount?.map((item) => {
                const key = item?.dataValues?.total_amount;
                return key
            })


            let Total_deposit_requests_weekly_count = await db.Transactions.count(
                {
                    where: {
                        trans_status: "PAYMENT_SUCCESS",
                        createdAt: {
                            [Op.gte]: moment().subtract(7, 'days').toDate()
                        }
                    }
                }
            )
            let Total_deposit_requests_monthly_count = await db.Transactions.count({
                where: {
                    trans_status: "PAYMENT_SUCCESS", createdAt: {
                        [Op.gte]: moment().subtract(30, 'days').toDate()
                    },
                }
            })

            let Credexon_Coins_Used_Today_Data = await db.Transactions.findAll(
                {
                    where: {
                        trans_status: "PAYMENT_SUCCESS",
                        createdAt: {
                            [Op.gte]: dateValue
                        }

                    },
                    attributes: [
                        [Sequelize.literal('SUM(amount)'), 'total_amount']
                    ]
                })

            const Credexon_Coins_Used_Today = Credexon_Coins_Used_Today_Data?.map((item) => {
                const key = item?.dataValues?.total_amount;
                return key
            })

            return res.send(response({
                Active_user_count: Active_user_count,
                Total_registrations_count: Total_registrations_count,
                signup_count: signup_count,
                create_contest_count: create_contest_count,
                active_contest_count: active_contest_count,
                inactive_contest_count: inactive_contest_count,
                Total_withdrawal_request_count: Total_withdrawal_request_count,
                Total_withdraw_requests_today_count: Total_withdraw_requests_today_count,
                india_users: india_users,
                uk_users: uk_users,
                visitior: visitior,
                Total_complate_KYC_count: Total_complate_KYC_count,
                Total_incomplate_KYC_count: Total_incomplate_KYC_count,
                Total_first_deposit_count: Total_first_deposit_count.length,
                Total_repeating_deposit_count: Total_repeating_deposit_count.length,
                Total_signup_user_web_count: Total_signup_user_web_count,
                Total_signup_user_device_count: Total_signup_user_device_count,
                Total_withdraw_requests_weekly_count: Total_withdraw_requests_weekly_count,
                Total_withdraw_requests_monthly_count: Total_withdraw_requests_monthly_count,
                Total_installation_count: Total_installation_count,
                Total_deposit_requests_today_count: Total_deposit_requests_today_count,
                Total_deposit_requests_weekly_count: Total_deposit_requests_weekly_count,
                Total_deposit_requests_monthly_count: Total_deposit_requests_monthly_count,
                Total_deposit_amount_today: Total_deposit_amount_today,

            }, "Data found succesfully.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },

    dashbord_vendors_details: async (req, res, next) => {
        try {
          // Establishing Database Connections
          const id = req.body.id;
          const connection = await connectWithMasterDb();
          const MasterUsersSchema = createMasterUsersModel(connection);
          const masterUser = await MasterUsersSchema.findOne({ _id: ObjectID(id) });
          if (!masterUser) {
            return res.send(response({}, "Vendor not found", false));
          }
          const dbName = masterUser.dbname;
          const vendorDbConnection = await connectWithVendorDb(dbName);
          const ContestsSchema = createContestsModel(vendorDbConnection);
          const UsersSchema = createUsersModel(vendorDbConnection);
          const todayStart = moment().startOf("day").toDate();
          //Todo: i don't think we need to find this by userType because we are finding users on vendor level same for below
          const results = await UsersSchema.aggregate([
            {
              $facet: {
                totalRegistrations: [
                  { $match: { usertype: config.role.user } },
                  { $count: "count" },
                ],
                signupCount: [
                  {
                    $match: {
                      usertype: config.role.user,
                      createdAt: { $gte: todayStart },
                    },
                  },
                  { $count: "count" },
                ],
              },
            },
          ]);
          const totalRegistrationsCount =
            results[0].totalRegistrations[0]?.count || 0;
          const signupCount = results[0].signupCount[0]?.count || 0;
          // **Users Aggregation - Active Users**
          const Active_user_count = await UsersSchema.countDocuments({
            totaljoinfee: { $gt: 0 },
          });
          // **:fire: Contest Counts**
          const contestStats = await ContestsSchema.aggregate([
            {
              $facet: {
                create_contest_count: [
                  { $match: { status: { $in: [0, 1] } } },
                  { $count: "count" },
                ],
                active_contest_count: [
                  { $match: { status: 1 } },
                  { $count: "count" },
                ],
                inactive_contest_count: [
                  { $match: { status: 0 } },
                  { $count: "count" },
                ],
              },
            },
          ]);
          const create_contest_count =
            contestStats[0].create_contest_count[0]?.count || 0;
          const active_contest_count =
            contestStats[0].active_contest_count[0]?.count || 0;
          const inactive_contest_count =
            contestStats[0].inactive_contest_count[0]?.count || 0;
          return res.send(
            response(
              {
                active_user_count: Active_user_count,
                total_registrations_count: totalRegistrationsCount, //Todo: i think we should change the key
                signup_count: signupCount,
                create_contest_count: create_contest_count,
                active_contest_count: active_contest_count,
                inactive_contest_count: inactive_contest_count,
              },
              "Data found succesfully.!!!",
              true
            )
          );
        } catch (error) {
          return res
            .status(400)
            .send(
              response({}, "Something went wrong.!!!", false, null, error.stack)
            );
        }
      },
    
}