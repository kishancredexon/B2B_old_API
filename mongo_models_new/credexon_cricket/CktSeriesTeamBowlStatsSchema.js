const mongoose = require("mongoose")

const cktSeriesTeamBowlStatsSchema = mongoose.Schema({
    cid: { type: Number },
    matches: { type: Number },
    innings: { type: Number },
    balls: { type: Number },
    overs: { type: String },
    runs: { type: Number },
    wickets: { type: Number },
    bestinning: { type: String },
    bestmatch: { type: String },
    econ: { type: String },
    average: { type: String },
    strike: { type: String },
    wicket4i: { type: Number },
    wicket5i: { type: Number },
    wicket10m: { type: Number },
    updated: { type: String },
    maidens: { type: Number },
    hattrick: { type: Number },
    expensive_over_runs: { type: Number },
    Aaverage: { type: String },
    team: { type: Object },
    player: { type: Object }
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
cktSeriesTeamBowlStatsSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createCktSeriesTeamBowlStatsModel = (connection) => {
    return connection.model("ckt_series_team_bowl_stats", cktSeriesTeamBowlStatsSchema);
};

module.exports = createCktSeriesTeamBowlStatsModel;
