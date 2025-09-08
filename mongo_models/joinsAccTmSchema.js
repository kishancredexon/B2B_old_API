const mongoose = require("mongoose");
const { keyGen } = require("../helper/common");

const sJoinsAccTmSchema = (reqdb) => {
    let joinsAccTmSchema = mongoose.Schema({
        league_id: { type: Number },
        userid: { type: Number},
        team_id: { type: Number },
        sharecnt: { type: Number},
        pamount: { type: Number, default: 0 },
        platformfee:{ type: Number, default: 0 },
        totalpnt: { type: Number, default: 0 },
        winamt: { type: Number, default: 0 },
        gametype: { type: String },//ckt,fb
        gamekey: { type: String }//[tmcont=4 winners, pzpool= 1 winners]
    }, {
        timestamps: true,
        versionKey: false
    });

    let dbkey = keyGen(reqdb);
    let modelName = "joinsacctms" + dbkey;

    if (mongoose.models[modelName]) {
        return mongoose.models[modelName];
    } else {
        return mongoose.model(modelName, joinsAccTmSchema);
    }
};

module.exports = sJoinsAccTmSchema;