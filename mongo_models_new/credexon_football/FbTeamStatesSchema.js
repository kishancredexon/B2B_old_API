const mongoose = require("mongoose")

const fbTeamStatesSchema = new mongoose.Schema({
    "season_id": { type: Number },
    "league_id": { type: Number },
    "match_id": { type: Number },
    "team_id": { type: Number },
    "legacy_id": { type: Number },
    "name": { type: String },
    "short_code": { type: String },
    "country_id": { type: Number },
    "national_team": { type: Boolean },
    "founded": { type: Number },
    "logo_path": { type: String },
    "venue_id": { type: Number, default: null },
    "vanue_name": { type: String, default: "" },
    "vanue_city": { type: String, default: "" },
    "vanue_image_path": { type: String, default: "" },
    "rivals_logo_path": { type: String, default: "" },
    "stats": { type: Object }
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
fbTeamStatesSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createFbTeamStatesModel = (connection) => {
    return connection.model("fb_team_states", fbTeamStatesSchema);
};

module.exports = createFbTeamStatesModel;
