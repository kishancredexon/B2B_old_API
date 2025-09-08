const response = require("../../helper/response");
const createUserPanModel = require("../../mongo_models_new/credexon_vendor/UserPanSchema");
const createTransactionsModel = require("../../mongo_models_new/credexon_vendor/TransactionsSchema");
const { connectWithVendorDb } = require("../../config/mongodb_connections");

module.exports = {
    tds_list: async (req, res) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UserPanSchema = createUserPanModel(vendorDbConnection);
            const TransactionsSchema = createTransactionsModel(vendorDbConnection);

            const size = parseInt(req.query.size) || 10;
            const page = parseInt(req.query.page) || 1;
            const params = req.body;

            const Tds_list = await TransactionsSchema.aggregate([
                { $match: { atype: params.atype } },
                { $sort: { createdAt: -1 } },
                { $skip: (page - 1) * size },
                { $limit: size },
                {
                    $lookup: {
                        from: "users",
                        localField: "userid",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                { $unwind: "$user" },
                {
                    $project: {
                        tid: 1, amount: 1, status: 1, txdate: 1, ttype: 1, atype: 1, wit: 1, prebal: 1, curbal: 1, jpoolid: 1, gtype: 1,
                        "user.id": "$user._id", "user.email": 1, "user.phone": 1, "user.country_code": 1, "user.wltwin": 1
                    }
                }
            ]);

            const finalArray = Tds_list.map(item => ({
                wltwin: item.user.wltwin,
                userid: item.user.id,
                phone: item.user.phone,
                country_code: item.user.country_code,
                email: item.user.email,
                transaction_date: item.txdate,
                atype: item.atype,
                jpoolid: item.jpoolid,
                gtype: item.gtype,
                amount: item.amount,
                tid: item.tid
            }));

            if (finalArray.length > 0) {
                const finalData = await Promise.all(finalArray.map(async itemData => {
                    itemData.user_pan = await UserPanSchema.findOne({ userid: itemData.userid });
                    return itemData;
                }));

                const total_count = await TransactionsSchema.countDocuments({ atype: params.atype });

                return res.send(response({ Tds_list: finalData, total_count }, "Data found succesfully.!!!", true))
            } else {
                return res.send(response({ Tds_list: [], total_count: 0 }, "No data found.", false))
            }

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    }
}