const mongoose = require("mongoose");

const fbplayerdetailSchema = mongoose.Schema({
    // "season_id": { type: Number },
    // "match_id": { type: Number },
    // "league_id": { type: Number },
    // "tid": { type: Number },
    // "pid": { type: Number },
    // "team_id": { type: Number },
    // "country_id": { type: Number },
    // "position_id": { type: Number },
    // "common_name": { type: String },
    // "display_name": { type: String },
    // "fullname": { type: String },
    // "firstname": { type: String },
    // "lastname": { type: String },
    // "nationality": { type: String },
    // "birthdate": { type: String },
    // "birthcountry": { type: String },
    // "birthplace": { type: String },
    // "height": { type: String },
    // "weight": { type: String },
    // "image_path": { type: String },
    // "selectedBy":{ type: String},
    
    "id": { type: Number },
    "active": { type: Boolean },
    "type": { type: String },
    "country_id": { type: Number },
    "logo_path": { type: String },//image_path
    "short_code": { type: String },
    "name": { type: String },
    "sport_id": { type: Number },
    "sub_type": { type: String },
    "last_played_at": { type: String },
    "category": { type: Number },
    "has_jerseys": { type: Boolean },
    "in_plan": { type: Boolean }
},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model("fbplayerdetail", fbplayerdetailSchema, "fbplayerdetail")
