const mongoose = require("mongoose");

const fbLeaguesSeasonsSchema = mongoose.Schema({
    "id": { type: Number },
    "season_id": { type: Number },
    "league_id": { type: Number },
    "name": { type: String },
    "is_current": { type: Boolean },
    "standings_recalculated_at": { type: Date },
    "start_season": { type: Number },
    "end_season": { type: Number },
    
    "date_start_ist": { type: Date },
    "date_end_ist": { type: Date },
    "status":{ type: String },
    "is_team": { type: Number },
    "is_fantasy_tm": { type: Number },
    "tmacc_ispaid": { type: Number },
    "pzpool_ispaid": { type: Number },
    "is_allpublish":{ type: Number,default:0}
}, {
    timestamps: true,
    versionKey: false,
    // toJSON: { virtuals: true }, // Include virtuals in JSON responses
    // toObject: { virtuals: true }, // Include virtuals in object responses
});

//Todo: Remove because id already exist
// Add a virtual field for `id`
// fbLeaguesSeasonsSchema.virtual("id").get(function () {
//     return this._id.toHexString(); // Convert _id (ObjectId) to a string
// });

const createFbLeaguesSeasonsModel = (connection) => {
    return connection.model("fb_seasons", fbLeaguesSeasonsSchema);
};

module.exports = createFbLeaguesSeasonsModel;
