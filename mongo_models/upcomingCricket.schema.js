const mongoose = require("mongoose");
const { keyGen } = require("../helper/common");

let UpcomingCricketModel;

let upComgCKT = (reqdb) => {
    let dbkey = keyGen(reqdb);
    
    if (!UpcomingCricketModel) {
        let objSch={  
            "match_id": { type: Number},
            "cid":{ type: Number},
            "title": { type: String},
            "league_name": { type: String},
            "short_title":{ type: String},
            "subtitle":{ type: String},
            "format": { type: Number},
            "format_str": { type: String},
            "status": { type: Number}, // Status=1 (upcoming), Status=2(Result), Status=3(Live), Status=4(Cancelled).
            "status_str":{ type: String},
            "status_note":{ type: String},
            "verified": { type: Boolean},
            "pre_squad": { type: Boolean},
            "odds_available": { type: Boolean},
            "game_state": { type: Number},
            "game_state_str": { type: String},
            "domestic": { type: Number},
            "competition": { type: Object},
            "teama": { type: Object},
            "teamb":{ type: Object},
            "date_start": { type: Date},
            "date_end": { type: Date},
            "timestamp_start": { type: Number},
            "timestamp_end": { type: Number},
            "date_start_ist":{ type: Date},
            "date_end_ist": { type: Date},
            "venue": { type: Object},
            "umpires":{ type: String},
            "referee":{ type: String},
            "equation":{ type: String},
            "live":{ type: String},
            // "result":{ type: String},
            "result_type": { type: Number},
            "win_margin": { type: String},
            "winning_team_id": { type: Number},
            "commentary": { type: Number},
            "wagon": { type: Number},
            "latest_inning_number": { type: Number},
            "presquad_time": { type: Date},
            "verify_time":{ type: Date},
            "toss": { type: Object},
            "is_playing11":{ type: Number},
            "players":{ type: Object},
            ["is_active"+dbkey]:{ type: Number,default:0},
            ["is_publish"+dbkey]:{ type: Number,default:0},
            "is_allpublish":{ type: Number,default:0},
            "is_paid":{ type: Number},
            "rstatus": {type:Number},
            "rtype" : {type:String}
            
        };
        console.log("objSch===>>",JSON.stringify(objSch));
        let upcomingCricketSchema = mongoose.Schema(objSch, {
            timestamps: true,
            versionKey: false
        });
        
        UpcomingCricketModel = mongoose.model("upcomingcrickets", upcomingCricketSchema);
    }

    return UpcomingCricketModel;
};

module.exports = upComgCKT;
