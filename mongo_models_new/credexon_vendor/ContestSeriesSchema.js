const mongoose = require("mongoose");

const contestSeriesSchema = new mongoose.Schema({
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
    rstatus: { type: Number, default: 1 }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
});

// Add a virtual field for `id`
contestSeriesSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createContestSeriesModel = (connection) => {
    return connection.model("contest_series", contestSeriesSchema);
};

module.exports = createContestSeriesModel;
