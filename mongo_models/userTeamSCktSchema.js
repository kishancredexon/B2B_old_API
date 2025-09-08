const mongoose = require("mongoose");
const { keyGen } = require("../helper/common");

const sUserteamscktSchema = (reqdb) => {
    let userteamscktSchema = mongoose.Schema({
        // _id: { type: Object },
        userid: { type: Number },
        league_id: { type: Number },
    }, {
        timestamps: true,
        versionKey: false
    });

    let dbkey = keyGen(reqdb);
    let modelName = "userteamsckts" + dbkey;

    if (mongoose.models[modelName]) {
        return mongoose.models[modelName];
    } else {
        return mongoose.model(modelName, userteamscktSchema);
    }
};

module.exports = sUserteamscktSchema;
