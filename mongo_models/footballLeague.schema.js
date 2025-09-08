const mongoose = require("mongoose");
const { keyGen } = require("../helper/common");


let FootballLeagueSchema;

let upComgLeagueFB = (reqdb) => {
    let dbkey = keyGen(reqdb);
    
    if (!FootballLeagueSchema) {
        const footballLeagueSchema = mongoose.Schema({  
            "id": { type: Number },
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
            ["is_active"+dbkey]: { type: Number, default: 0 },
            ["is_publish"+dbkey]: { type: Number, default: 0 },
            "short_code":{ type: String }
        }, {
            timestamps: true,
            versionKey: false
        });
        
        FootballLeagueSchema = mongoose.model("fbleagues", footballLeagueSchema);
    }

    return FootballLeagueSchema;
};

module.exports = upComgLeagueFB;
