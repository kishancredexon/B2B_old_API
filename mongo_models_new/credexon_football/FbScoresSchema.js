const mongoose = require("mongoose");

const fbScoresSchema = mongoose.Schema({
    "match_id": { type: Number },
    "league_id": { type: Number },
    "season_id": { type: Number },
    "stage_id": { type: Number },
    "round_id": { type: Number },
    "group_id": { type: Number },
    "status": { type: String },
    "date_start": { type: Date },
    "aggregate_id": { type: Number },
    "venue_id": { type: Number },
    "referee_id": { type: Number },
    "localteam_id": { type: Number },
    "visitorteam_id": { type: Number },
    "winner_team_id": { type: Number },
    "weather_report": { type: Object },
    "commentaries": { type: Boolean },
    "attendance": { type: String },
    "pitch": { type: String },
    "details": { type: String },
    "neutral_venue": { type: Boolean },
    "winning_odds_calculated": { type: Boolean },
    "formations": { type: Object },
    "scores": { type: Object },
    "time": { type: Object },
    "coaches": { type: Object },
    "standings": { type: Object },
    "assistants": { type: Object },
    "leg": { type: String },
    "colors": { type: Object },
    "deleted": { type: Boolean },
    "is_placeholder": { type: Boolean },
    "lineup": { type: Object },
    "bench": { type: Object }


},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
fbScoresSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createFbScoresModel = (connection) => {
    return connection.model("fb_scores", fbScoresSchema);
};

module.exports = createFbScoresModel;
