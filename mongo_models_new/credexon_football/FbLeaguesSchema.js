const mongoose = require("mongoose");

const fbLeaguesSchema = mongoose.Schema({
    "active": { type: Boolean },
    "type": { type: String },
    "legacy_id": { type: Number },
    "country_id": { type: Number },
    "logo_path": { type: String },
    "name": { type: String },
    "is_cup": { type: Boolean },
    "is_friendly": { type: Boolean },
    "current_season_id": { type: Number },
    "current_round_id": { type: Number },
    "current_stage_id": { type: Number },
    "live_standings": { type: Boolean },
    "coverage": { type: Object },
    "date_start": { type: Date },
    "updatedAt": { type: Date },
    "date_end": { type: Date },
    "status": { type: String },
    "league_id": { type: Number },
    "season_id": { type: Number },
    "is_current_season": { type: Boolean },
    "is_active": { type: Number, default: 0 },//Todo: dbkey removed
    "is_publish": { type: Number, default: 0 },//Todo: dbkey removed
    "short_code": { type: String }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
});

//Todo: Remove because id already exist
// Add a virtual field for `id`
fbLeaguesSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createFbLeaguesModel = (connection) => {
    return connection.model("fb_leagues", fbLeaguesSchema);
};

module.exports = createFbLeaguesModel;
