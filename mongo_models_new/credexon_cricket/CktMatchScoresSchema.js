const mongoose = require("mongoose");

const cktMatchScoresSchema = mongoose.Schema({
    "match_id": { type: Number },
    "title": { type: String },
    "short_title": { type: String },
    "subtitle": { type: String },
    "format": { type: Number },
    "format_str": { type: String },
    "status": { type: Number },
    "status_str": { type: String },
    "status_note": { type: String },
    "verified": { type: Boolean },
    "pre_squad": { type: Boolean },
    "odds_available": { type: Boolean },
    "game_state": { type: Number },
    "game_state_str": { type: String },
    "competition": { type: Object },
    "teama": { type: Object },
    "teamb": { type: Object },
    "date_start": { type: Date },
    "date_end": { type: Date },
    "timestamp_start": { type: Number },
    "timestamp_end": { type: Number },
    "date_start_ist": { type: Date },
    "date_end_ist": { type: Date },
    "venue": { type: Object },
    "umpires": { type: String },
    "referee": { type: String },
    "equation": { type: String },
    "live": { type: String },
    "result": { type: String },
    "result_type": { type: Number },
    "win_margin": { type: String },
    "winning_team_id": { type: Number },
    "commentary": { type: Number },
    "wagon": { type: Number },
    "latest_inning_number": { type: Number },
    "presquad_time": { type: Date },
    "verify_time": { type: Date },
    "toss": { type: Object },
    "current_over": { type: String },
    "previous_over": { type: String },
    "man_of_the_match": { type: Object },
    "man_of_the_series": { type: Object },
    "is_followon": { type: Number },
    "team_batting_first": { type: String },
    "team_batting_second": { type: String },
    "last_five_overs": { type: String },
    "live_inning_number": { type: String },
    "innings": { type: Array },
    "players": { type: Array },
    "pre_match_odds": { type: Array },
    "day_remaining_over": { type: String }

},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
cktMatchScoresSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createCktMatchScoresModel = (connection) => {
    return connection.model("ckt_match_scores", cktMatchScoresSchema);
};

module.exports = createCktMatchScoresModel;
