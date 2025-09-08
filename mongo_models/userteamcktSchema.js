const { ObjectID } = require("mongodb");
const mongoose = require("mongoose");
const { keyGen } = require("../helper/common");

const sUserteamcktSchema = (reqdb) => {
    let userteamcktSchema = mongoose.Schema({
      // _id: { type: Object },
    userid: { type: Number },
    match_id: { type: Number },
    team_no: { type: Number }
    }, {
        timestamps: true,
        versionKey: false
    });

    let dbkey = keyGen(reqdb);
    let modelName = "userteamckts" + dbkey;

    if (mongoose.models[modelName]) {
        return mongoose.models[modelName];
    } else {
        return mongoose.model(modelName, userteamcktSchema);
    }
};

module.exports = sUserteamcktSchema;