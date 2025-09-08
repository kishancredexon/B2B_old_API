const response = require("../../helper/response");
let sdb = require("../../models");
const { Op } = require('sequelize');
const { connectWithVendorDb } = require("../../config/mongodb_connections");
const createTransactionsModel = require("../../mongo_models_new/credexon_vendor/TransactionsSchema");
const createUsersModel = require("../../mongo_models_new/credexon_vendor/UsersSchema");

module.exports = {
    wallet_list: async (req, res) => {
        try {
            const size = parseInt(req.query.size) || 10; // Default page size
            const page = parseInt(req.query.page) || 1;

            const { dbName } = req.user;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UsersSchema = createUsersModel(vendorDbConnection);

            const walletList = await UsersSchema.find({}, {
                id: "$_id",
                phone: 1,
                email: 1,
                country_code: 1,
                walletbalance: 1,
                wltwin: 1,
                wltbns: 1,
                name: 1
            })
                .sort({ createdAt: -1 }) // Sorting by creation date (latest first)
                .skip((page - 1) * size) // Skipping previous pages
                .limit(size) // Limiting results per page
                .lean(); // Optimizing query for performance

            const updatedWalletList = walletList.map((walletDetail) => ({
                ...walletDetail,
                user_profile: {
                    name: walletDetail.name || ""
                }
            }))

            const total_count = await UsersSchema.countDocuments();

            return res.send(response({
                total_count: total_count,
                wallet_list: updatedWalletList,
            }, "Data found succesfully.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    wallet_filter: async (req, res) => {
        try {
            const { dbName } = req.user;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UsersSchema = createUsersModel(vendorDbConnection);

            const params = req.body;

            let filter = {};
            if (params.email || params.phone) {
                filter.$or = [];
                if (params.email) filter.$or.push({ email: params.email });
                if (params.phone) filter.$or.push({ phone: params.phone });
            }

            const walletList = await UsersSchema.find(filter, {
                id: "$_id",
                phone: 1,
                email: 1,
                country_code: 1,
                walletbalance: 1,
                wltwin: 1,
                wltbns: 1,
                name: 1
            }).lean();

            const updatedWalletList = walletList.map((walletDetail) => ({
                ...walletDetail,
                user_profile: {
                    name: walletDetail.name || ""
                }
            }))

            return res.send(response({ wallet_list: updatedWalletList, }, "Data found succesfully.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    wallet_update: async (req, res) => {
        try {
            const { dbName } = req.user;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UsersSchema = createUsersModel(vendorDbConnection);
            const { userid, addamount, deductamount } = req.body;

            const params = req.body;

            const walletView = await UsersSchema.findOne(
                { _id: userid },
                { id: "$_id", phone: 1, email: 1, country_code: 1, walletbalance: 1, wltwin: 1, wltbns: 1 }
            ).lean();

            if (!walletView) {
                return res.status(404).send(response({}, "User not found!", false));
            }

            let update = {};
            if (addamount) {
                update.walletbalance = walletView["walletbalance"] + Number(addamount)
            } else if (deductamount) {
                update.walletbalance = walletView["walletbalance"] - params.deductamount;
            } else {
                return res.send(response({}, `data not update!`, true))
            }

            await UsersSchema.updateOne({ _id: userid }, { $set: update });

            return res.send(response({ walletView }, `wallet balance update successfully!`, true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    withdraw_list: async (req, res) => {
        try {
            const { dbName } = req.user;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const TransactionsSchema = createTransactionsModel(vendorDbConnection);

            const page = parseInt(req.query.page) || 1;
            const size = parseInt(req.query.size) || 10;

            const withdrawList = await TransactionsSchema.aggregate([
                { $match: { atype: "bal_wtd_req" } },
                {
                    $lookup: {
                        from: "users", // Collection name in MongoDB
                        localField: "userid",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                { $unwind: "$user" }, // Flatten the user array
                {
                    $project: {
                        id: "$_id",
                        amount: 1,
                        status: 1,
                        txdate: 1,
                        ttype: 1,
                        atype: 1,
                        wit: 1,
                        prebal: 1,
                        curbal: 1,
                        "user._id": 1,
                        "user.email": 1,
                        "user.phone": 1,
                        "user.country_code": 1,
                        "user.name": 1
                    }
                },
                { $sort: { createdAt: -1 } },
                { $skip: (page - 1) * size },
                { $limit: size }
            ]);

            const totalCount = await TransactionsSchema.countDocuments({ atype: "bal_wtd_req" });

            const updatedWithdrawList = withdrawList.map((withdrawDetail) => ({
                ...withdrawDetail,
                user: {
                    ...withdrawDetail.user,
                    id: withdrawDetail.user._id,
                    user_profile: {
                        name: withdrawDetail?.user?.name || ""
                    }
                }
            }))

            return res.send(response({
                total_count: totalCount,
                Withdraw_list: updatedWithdrawList,
            }, "Data found succesfully.!!!", true))

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    }
}