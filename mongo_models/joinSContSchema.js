const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const { keyGen } = require("../helper/common");

const sJoinSContSchema = (reqdb) => {
    let joinSContSchema = mongoose.Schema({
        league_id: { type: Number },
        userid: { type: Number},
        poolid: { type: ObjectId },
        uteamid: { type: ObjectId },
        //gamekey: { type: Number},
        pamount: { type: Number, default: 0 },
        totalpnt: { type: Number, default: 0 },
        winamt: { type: Number, default: 0 },
        gametype: { type: String }//ckt,fb
    }, {
        timestamps: true,
        versionKey: false
    });

    let dbkey = keyGen(reqdb);
    let modelName = "joinsconts" + dbkey;

    if (mongoose.models[modelName]) {
        return mongoose.models[modelName];
    } else {
        return mongoose.model(modelName, joinSContSchema);
    }
};

module.exports = sJoinSContSchema;


