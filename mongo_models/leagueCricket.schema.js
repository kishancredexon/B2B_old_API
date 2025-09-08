const mongoose = require("mongoose");
const { keyGen } = require("../helper/common");


let LeagueCricketSchema;

let upComgLeagueCKT = (reqdb) => {
    let dbkey = keyGen(reqdb);
    
    if (!LeagueCricketSchema) {
        const leagueCricketSchema = mongoose.Schema({  
            "cid": { type: Number },
            "name": { type: String },
            "abbr": { type: String },
            "type": { type: String },
            "category": { type: String },
            "match_format": { type: String },
            "status": { type: String },
            "season": { type: String },
            "date_start": { type: Date },
            "date_end": { type: Date },
            "country": { type: String },
            "total_matches": { type: Number },
            "total_rounds": { type: Number },
            "total_teams": { type: Number },
            "matches_url": { type: String },
            "teams_url": { type: String },
            "standings_url": { type: String },
            "rounds": { type: Object },
            ["is_active"+dbkey]: { type: Number, default: 0 },
            ["is_publish"+dbkey]: { type: Number, default: 0 },
            "logo_url": { type: String }
            
        }, {
            timestamps: true,
            versionKey: false
        });
        
        LeagueCricketSchema = mongoose.model("cktleagues", leagueCricketSchema);
    }

    return LeagueCricketSchema;
};

module.exports = upComgLeagueCKT;
