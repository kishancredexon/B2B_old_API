const mongoose = require("mongoose");
const { keyGen } = require("../helper/common");

let UpcomingFootballModel;

let upComgFB = (reqdb) => {
    let dbkey = keyGen(reqdb);
    
    if (!UpcomingFootballModel) {
        const upcomingFootballSchema = mongoose.Schema({  
            "match_id" : {type:Number},
            "league_id" :{type:Number},
            "league_name": { type: String},
            "season_id" :{type:Number},
            "stage_id" :{type:Number},
            "round_id" :{type:Number},
            "group_id" :{type:Number},
            "date_start":{type:Date},
            "date_start_ist":{type:Date},
            "aggregate_id" :{type:Number},
            "venue_id" :{type:Number},
            "referee_id" :{type:Number},
            "localteam_id" :{type:Number},
            "visitorteam_id" :{type:Number},
            "winner_team_id" : {type:Number},
            "weather_report" : {type:Object},
            "commentaries" : {type:Boolean},
            "attendance" : {type:String},
            "pitch" : {type:String},
            "details" : {type:String},
            "neutral_venue" : {type:Object},
            "winning_odds_calculated" : {type:Object},
            "formations" : {type:Object},
            "scores" : {type:Object},
            "time" : {type:Object},
            "coaches" : {type:Object},
            "standings" : {type:Object},
            "assistants" : {type:Object},
            "leg" :{type:String},
            "colors" : {type:Object},
            "deleted" : {type:Object},
            "is_placeholder" : {type:Object},
            "lineup" : {type:Object},
            "bench" : {type:Object},
            "isplayer":{type:Number},//new
            "localTeam" : {type:Object},//new
            "visitorTeam" : {type:Object},//new
            "status" : {type:String},
            "teama": { type: Object},
            "teamb":{ type: Object},
            ["is_active"+dbkey]:{ type: Number,default:0},
            ["is_publish"+dbkey]:{ type: Number,default:0},
            "is_allpublish":{ type: Number,default:0},
            "rstatus":{type: Number},
            "is_playing11":{ type: Number}
        }, {
            timestamps: true,
            versionKey: false
        });
        
        UpcomingFootballModel = mongoose.model("fbupcomings", upcomingFootballSchema);
    }

    return UpcomingFootballModel;
};

module.exports = upComgFB;
