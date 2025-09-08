const mongoose = require("mongoose");

const fbTeamsSchema = mongoose.Schema({
    "season_id": { type: Number },
    "league_id": { type: Number },
    "season_name": { type: String },
    "team_id": { type: Number },
    "legacy_id": { type: Number },
    "name": { type: String },
    "short_code": { type: String },
    "twitter": { type: String },
    "country_id": { type: Number },
    "national_team": { type: Boolean },
    "founded": { type: Number },
    "logo_path": { type: String },
    "venue_id": { type: Number },
    "current_season_id": { type: Number },
    "is_placeholder": { type: Boolean },
    "squad": { type: Object }
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
fbTeamsSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createFbTeamsModel = (connection) => {
    return connection.model("fb_teams", fbTeamsSchema);
};

module.exports = createFbTeamsModel;
