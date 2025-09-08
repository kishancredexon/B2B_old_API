const mongoose = require("mongoose");
const { keyGen } = require("../helper/common");

const sUserteamfbSchema = (reqdb) => {
    let userteamfbSchema = mongoose.Schema({
      // _id: { type: Object },
      userid: { type: Number },
      match_id: { type: Number },
      team_no: { type: Number }
    }, {
        timestamps: true,
        versionKey: false
    });

    let dbkey = keyGen(reqdb);
    let modelName = "userteamfbs" + dbkey;

    if (mongoose.models[modelName]) {
        return mongoose.models[modelName];
    } else {
        return mongoose.model(modelName, userteamfbSchema);
    }
};

module.exports = sUserteamfbSchema;