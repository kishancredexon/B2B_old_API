const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { keyGen } = require("../helper/common");

const sTransactionsSchema = (reqdb) => {
    let transactionsSchema = mongoose.Schema({
        id: Number,
        userid: Number,
        amount: Number,
        txid: String,
        status: String,
        txdate: Number,
        docid: Number,
        ttype: String,
        atype: String,
        wit: String,
        prebal: Number,
        curbal: Number,
        jpoolid: ObjectId,
        gtype: String,
        order_id: String,
        trans_status: String,
        tid: Number,
        bonusbal:Number,
        bnstring: String,
        createdAt:Date,
        updatedAt:Date
    }, {
        timestamps: true,
        versionKey: false
    });

    let dbkey = keyGen(reqdb);
    let modelName = "transactions" + dbkey;

    if (mongoose.models[modelName]) {
        return mongoose.models[modelName];
    } else {
        return mongoose.model(modelName, transactionsSchema);
    }
};

module.exports = sTransactionsSchema;