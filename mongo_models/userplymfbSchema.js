const { ObjectID } = require("mongodb");
const mongoose = require("mongoose");
const { keyGen } = require("../helper/common");

const sUserplymfbSchema = (reqdb) => {
    let userplymfbSchema = mongoose.Schema({
        // _id: { type: Object },
        pid: { type: Number },
        match_id: { type: Number },
        uteamid: { type: ObjectID }, 
        userid: { type: Number },
        is_substitue: { type: Number,default:0}, 
        playing_role:{ type: Number },
        mteam_id:{ type: Number },
        teama_count: { type: Number },
        teamb_count: { type: Number },
        team_no: { type: Number }
    }, {
        timestamps: true,
        versionKey: false
    });

    let dbkey = keyGen(reqdb);
    let modelName = "userplymfbs" + dbkey;

    if (mongoose.models[modelName]) {
        return mongoose.models[modelName];
    } else {
        return mongoose.model(modelName, userplymfbSchema);
    }
};

module.exports = sUserplymfbSchema;


