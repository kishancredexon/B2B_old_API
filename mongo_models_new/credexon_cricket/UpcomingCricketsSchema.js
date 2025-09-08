const mongoose = require("mongoose");

let upcomingCricketSchema = mongoose.Schema({
    "match_id": { type: Number },
    "cid": { type: Number },
    "title": { type: String },
    "league_name": { type: String },
    "short_title": { type: String },
    "subtitle": { type: String },
    "format": { type: Number },
    "format_str": { type: String },
    "status": { type: Number }, // Status=1 (upcoming), Status=2(Result), Status=3(Live), Status=4(Cancelled).
    "status_str": { type: String },
    "status_note": { type: String },
    "verified": { type: Boolean },
    "pre_squad": { type: Boolean },
    "odds_available": { type: Boolean },
    "game_state": { type: Number },
    "game_state_str": { type: String },
    "domestic": { type: Number },
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
    // "result":{ type: String},
    "result_type": { type: Number },
    "win_margin": { type: String },
    "winning_team_id": { type: Number },
    "commentary": { type: Number },
    "wagon": { type: Number },
    "latest_inning_number": { type: Number },
    "presquad_time": { type: Date },
    "verify_time": { type: Date },
    "toss": { type: Object },
    "is_playing11": { type: Number },
    "is_players":{ type: Number, default: 0 },
    "players": { type: Object },
    "is_active": { type: Number, default: 0 },
    "is_publish": { type: Number, default: 0 },
    "is_allpublish": { type: Number, default: 0 },
    "is_paid": { type: Number },
    "rstatus": { type: Number },
    "rtype": { type: String }

}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
});

// Add a virtual field for `id`
upcomingCricketSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createUpcomingCricketModel = (connection) => {
    return connection.model("upcoming_crickets", upcomingCricketSchema);
};

module.exports = createUpcomingCricketModel;
