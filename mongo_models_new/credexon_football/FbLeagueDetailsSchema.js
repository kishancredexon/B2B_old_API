const mongoose = require("mongoose");

const fbLeagueDetailsSchema = mongoose.Schema({
    "id": { type: Number },
    "active": { type: Boolean },
    "type": { type: String },
    //"legacy_id": { type: Number },
    "country_id": { type: Number },
    "logo_path": { type: String },//image_path
    "short_code": { type: String },
    "name": { type: String },
    //"is_cup": { type: Boolean },
    //"is_friendly": { type: Boolean },
    //"current_season_id": { type: Number },
    //"current_round_id": { type: Number },
    //"current_stage_id": { type: Number },
    //"live_standings": { type: Boolean },
    //"coverage": { type: Object },
    // "date_start":{type:Date},
    // "date_end":{type:Date},
    // "date_start_ist":{type:Date},
    //"status":{type:String}
    "sport_id": { type: Number },
    "sub_type": { type: String },
    "last_played_at": { type: String },
    "category": { type: Number },
    "has_jerseys": { type: Boolean },
    "in_plan": { type: Boolean }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
});

//Todo: Remove because id already exist
// Add a virtual field for `id`
// fbLeagueDetailsSchema.virtual("id").get(function () {
//     return this._id.toHexString(); // Convert _id (ObjectId) to a string
// });

const createFbLeagueDetailsModel = (connection) => {
    return connection.model("fb_league_details", fbLeagueDetailsSchema);
};

module.exports = createFbLeagueDetailsModel;