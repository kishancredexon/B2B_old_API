const { ObjectID } = require("mongodb");
const mongoose = require("mongoose");
const { keyGen } = require("../helper/common");

const sUserplymcktSchema = (reqdb) => {
    let userplymcktSchema = mongoose.Schema({
        // _id: { type: Object },
        pid: { type: Number },
        match_id: { type: Number },
        uteamid: { type: ObjectID },
        is_substitue: { type: Number,default:0},      //0 =not subsstitue 1= substitue
        userid: { type: Number },
        playing_role:{ type: String },
        mteam_id:{ type: Number },
        teama_count: { type: Number },
        teamb_count: { type: Number },
        team_no: { type: Number }
    }, {
        timestamps: true,
        versionKey: false
    });

    let dbkey = keyGen(reqdb);
    let modelName = "userplymckts" + dbkey;

    if (mongoose.models[modelName]) {
        return mongoose.models[modelName];
    } else {
        return mongoose.model(modelName, userplymcktSchema);
    }
};

module.exports = sUserplymcktSchema;