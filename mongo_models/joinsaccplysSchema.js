const { ObjectID } = require("mongodb");
const mongoose = require("mongoose");
const { keyGen } = require("../helper/common");

const sJoinsAccPlysSchema = (reqdb) => {
    let joinsAccPlysSchema = mongoose.Schema({
        match_id: { type: Number },
        userid: { type: Number},
        pid: { type: Number },
        sharecnt: { type: Number},
        gkamount: { type: Number, default: 0 },
        totalpnt: { type: Number, default: 0 },
        winamt: { type: Number, default: 0 },
        platformfee:{ type: Number, default: 0 },
        gametype: { type: String },//ckt,fb
        gamekey: { type: String }//[plyacc]
    }, {
        timestamps: true,
        versionKey: false
    });

    let dbkey = keyGen(reqdb);
    let modelName = "joinsaccplys" + dbkey;

    if (mongoose.models[modelName]) {
        return mongoose.models[modelName];
    } else {
        return mongoose.model(modelName, joinsAccPlysSchema);
    }
};

module.exports = sJoinsAccPlysSchema;