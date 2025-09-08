const mongoose = require("mongoose");
const { keyGen } = require("../helper/common");

const sContestsseriesSchema = (reqdb) => {
    let contestsseriesSchema = new mongoose.Schema({
        contestseries_id: { type: String },
        contest_id: { type: Object },
        league_id: { type: Number },
        session_id: { type: Number },
        status: { type: Number, default: 0 },
        date_start: { type: Date },
        date_end: { type: Date },
        matchid_start: { type: Number },
        matchid_end: { type: Number },
        gtype: { type: String },
    }, {
        timestamps: true,
        versionKey: false
    });

    let dbkey = keyGen(reqdb);
    let modelName = "contestseries" + dbkey;

    // Check if the model already exists before creating it
    if (mongoose.models[modelName]) {
        return mongoose.model(modelName);
    } else {
        return mongoose.model(modelName, contestsseriesSchema);
    }
};

module.exports = sContestsseriesSchema;
