const mongoose = require("mongoose")

const cktSeriesTeamBatStatsSchema = mongoose.Schema({
    cid: { type: Number },
    matches: { type: Number },
    innings: { type: Number },
    notout: { type: Number },
    runs: { type: Number },
    balls: { type: Number },
    highest: { type: Number },
    run100: { type: Number },
    run50: { type: Number },
    run4: { type: Number },
    run6: { type: Number },
    average: { type: String },
    strike: { type: String },
    catches: { type: Number },
    stumpings: { type: Number },
    updated: { type: String },
    fastest50balls: { type: Number },
    fastest100balls: { type: Number },
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
cktSeriesTeamBatStatsSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createCktSeriesTeamBatStatsModel = (connection) => {
    return connection.model("ckt_series_team_bat_stats", cktSeriesTeamBatStatsSchema);
};

module.exports = createCktSeriesTeamBatStatsModel;
