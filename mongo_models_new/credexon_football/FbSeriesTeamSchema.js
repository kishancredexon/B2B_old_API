const mongoose = require("mongoose")

const fbSeriesTeamSchema = mongoose.Schema({
    id: { type: Number },
    name: { type: String },
    league_id: { type: Number },
    season_id: { type: Number },
    round_id: { type: Number },
    round_name: { type: Number },
    type: { type: String },
    stage_id: { type: Number },
    stage_name: { type: String },
    resource: { type: String },
    standings: { type: Object }
},
    {
        timestamps: true,
        versionKey: false,
        // toJSON: { virtuals: true }, // Include virtuals in JSON responses
        // toObject: { virtuals: true }, // Include virtuals in object responses
    });

//Todo: Remove because id already exist
// Add a virtual field for `id`
// fbSeriesTeamSchema.virtual("id").get(function () {
//     return this._id.toHexString(); // Convert _id (ObjectId) to a string
// });

const createFbSeriesTeamModel = (connection) => {
    return connection.model("fb_series_team", fbSeriesTeamSchema);
};

module.exports = createFbSeriesTeamModel;
