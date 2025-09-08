const mongoose = require("mongoose");

//Todo: Need to check keys payling11 and is_playing11
const cricketPlayerDetailsSchema = mongoose.Schema({
    // "match_id": { type: Number },
    // "teama": { type: Object },
    // "teamb": { type: Object },
    // "playing11": { type: Object },
    // "is_playing11": { type: Number },//0=Not playing, 1= Playing
    // "avg_point": { type: Number }
    "pid": { type: Object },
    "title": { type: String },
    "short_name": { type: String },
    "first_name": { type: String },
    "last_name": { type: String },
    "middle_name": { type: String },
    "birthdate": { type: Date },
    "birthplace": { type: String },
    "country": { type: String },
    "primary_team": { type: Array },
    "thumb_url": { type: String },
    "logo_url": { type: String },
    "playing_role": { type: String },
    "batting_style": { type: String },
    "bowling_style": { type: String },
    "fielding_position": { type: String },
    "recent_match": { type: Number },
    "recent_appearance": { type: Number },
    "fantasy_player_rating": { type: Number },
    "t": { type: Number },
    "nationality": { type: String }
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
cricketPlayerDetailsSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createCricketPlayerDetailsModel = (connection) => {
    return connection.model("ckt_player_details", cricketPlayerDetailsSchema);
};

module.exports = createCricketPlayerDetailsModel;

// "is_playing": 2 = not decided
// 1= playing
//0 = not playing