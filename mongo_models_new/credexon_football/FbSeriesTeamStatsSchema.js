const mongoose = require("mongoose")

const fbSeriesTeamStatsSchema = mongoose.Schema({
    id: { type: Number },
    name: { type: String },
    league_id: { type: Number },
    is_current_season: { type: Boolean },
    current_round_id: { type: Number },
    current_stage_id: { type: Number },
    goalscorers: { type: Object },
    assistscorers: { type: Object },
    cardscorers: { type: Object },
},
    {
        timestamps: true,
        versionKey: false,
        // toJSON: { virtuals: true }, // Include virtuals in JSON responses
        // toObject: { virtuals: true }, // Include virtuals in object responses
    });

//Todo: Remove because id already exist
// Add a virtual field for `id`
// fbSeriesTeamStatsSchema.virtual("id").get(function () {
//     return this._id.toHexString(); // Convert _id (ObjectId) to a string
// });

const createFbSeriesTeamStatsModel = (connection) => {
    return connection.model("fb_series_team_stats", fbSeriesTeamStatsSchema);
};

module.exports = createFbSeriesTeamStatsModel;
