const mongoose = require("mongoose");

const fbPlayerDetailsSchema = mongoose.Schema({
    "match_id": { type: Number },
    "league_id": { type: Number },
    "season_id": { type: Number},
    "tid": { type: Object },
    "pid": { type: Number },
    "team_id": { type: Number },
    "country_id": { type: Number },
    "position_id": { type: Number },
    "common_name": { type: String },
    "display_name": { type: String },
    "fullname": { type: String },
    "firstname": { type: String },
    "lastname": { type: String },
    "nationality": { type: String },
    "birthdate": { type: String },
    "birthcountry": { type: String },
    "birthplace": { type: String },
    "height": { type: String },
    "weight": { type: String },
    "image_path": { type: String },
    "is_playing": { type: Number },
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });


const createFbPlayerDetailsModel = (connection) => {
    return connection.model("fb_player_details", fbPlayerDetailsSchema);
};

module.exports = createFbPlayerDetailsModel;
