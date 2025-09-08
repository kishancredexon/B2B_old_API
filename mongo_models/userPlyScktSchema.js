const { ObjectID } = require("mongodb");
const mongoose = require("mongoose");
const { keyGen } = require("../helper/common");

const sUserplyscktSchema = (reqdb) => {
    let userplyscktSchema = mongoose.Schema({
     // _id: { type: Object },
     pid: { type: Number },
     league_id: { type: Number },
     uteamid: { type: ObjectID },
     is_substitue: { type: Number, default: 0 },      //0 =not subsstitue 1= substitue
     userid: { type: Number },
     playing_role: { type: String },
     mteam_id: { type: Number },
     team_count: { type: Object },
     team_no: { type: Number },
     match_ids: { type: Array },
     allmatch_id: { type: Array }
    }, {
        timestamps: true,
        versionKey: false
    });

    let dbkey = keyGen(reqdb);
    let modelName = "userplysckts" + dbkey;

    if (mongoose.models[modelName]) {
        return mongoose.models[modelName];
    } else {
        return mongoose.model(modelName, userplyscktSchema);
    }
};

module.exports = sUserplyscktSchema;



