const mongoose = require("mongoose");
const { keyGen } = require("../helper/common");

const sUserteamsfbSchema = (reqdb) => {
    let userteamsfbSchema = mongoose.Schema({
        // _id: { type: Object },
        userid: { type: Number },
        league_id: { type: Number },
    }, {
        timestamps: true,
        versionKey: false
    });

    let dbkey = keyGen(reqdb);
    let modelName = "userteamsfbs" + dbkey;

    if (mongoose.models[modelName]) {
        return mongoose.models[modelName];
    } else {
        return mongoose.model(modelName, userteamsfbSchema);
    }
};

module.exports = sUserteamsfbSchema;