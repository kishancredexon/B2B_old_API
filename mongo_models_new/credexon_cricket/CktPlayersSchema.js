const mongoose = require("mongoose");

const cktPlayersSchema = mongoose.Schema({
    // "match_id": { type: Number },
    // "league_id": { type: Number },
    // "tid": { type: Object },
    // "pid": { type: Object },
    // "title": { type: String },
    // "short_name": { type: String },
    // "first_name": { type: String },
    // "last_name": { type: String },
    // "middle_name": { type: String },
    // "birthdate": { type: Date },
    // "birthplace": { type: String },
    // "country": { type: String },
    // "primary_team": { type: Array },
    // "thumb_url": { type: String },
    // "logo_url": { type: String },
    // "playing_role": { type: String },
    // "batting_style": { type: String },
    // "bowling_style": { type: String },
    // "fielding_position": { type: String },
    // "recent_match": { type: Number },
    // "recent_appearance": { type: Number },
    // "fantasy_player_rating": { type: Number },
    // "t": { type: Number },
    // "nationality": { type: String },
    // "is_playing": { type: Number },
    // "selectedBy": { type: Boolean },
    "match_id": { type: Number },
    "tid": { type: Number },
    "pid": { type: Number },
    "is_playing": { type: Number },
    "selectedBy": { type: Boolean }
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

cktPlayersSchema.index({ pid: 1, first_name: 1 });
cktPlayersSchema.index({ pid: 1 });

// Add a virtual field for `id`
cktPlayersSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createCktPlayersModel = (connection) => {
    return connection.model("ckt_players", cktPlayersSchema);
};

module.exports = createCktPlayersModel;
