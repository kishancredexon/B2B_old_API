const mongoose = require("mongoose");

const fbUpcomingsSchema = mongoose.Schema({
    "id" : {type:Number},
    "league_name": { type: String},
    "match_id" : {type:Number},
    "league_id" :{type:Number},
    "season_id" :{type:Number},
    "stage_id" :{type:Number},
    "round_id" :{type:Number},
    "group_id" :{type:Number},
    "date_start":{type:Date},
    "date_start_ist":{type:Date},
    //"aggregate_id" :{type:Number},
    //"venue_id" :{type:Number},
    //"referee_id" :{type:Number},
    "localteam_id" :{type:Number},
    "visitorteam_id" :{type:Number},
    //"winner_team_id" : {type:Number},
    "weather_report" : {type:Object},
    //"commentaries" : {type:Boolean},
    //"attendance" : {type:String},
    //"pitch" : {type:String},
    //"details" : {type:String},
    //"neutral_venue" : {type:Object},
    //"winning_odds_calculated" : {type:Object},
    //"formations" : {type:Object},
    //"scores" : {type:Object},
    //"time" : {type:Object},
    //"coaches" : {type:Object},
    //"standings" : {type:Object},
    //"assistants" : {type:Object},
    "leg" :{type:String},
    //"colors" : {type:Object},
    //"deleted" : {type:Object},
    //"is_placeholder" : {type:Object},
    //"lineup" : {type:Object},
    //"bench" : {type:Object},
    "isplayer":{type:Number},//new
    "localTeam" : {type:Object},//new
    "visitorTeam" : {type:Object},//new
    "teama": { type: Object},
    "teamb":{ type: Object},
    "status" : {type:String},
    "rstatus": {type:Number},
    "is_playing11":{type:Number},
    "is_video_hl":{type:Number},
    "is_allpublish":{ type: Number,default:0},
    "is_players":{ type: Number},
    "is_score":{ type: Number},
    "is_plystats":{type:Number},
    "is_stats":{type:Number},
    "is_fantasypoints":{type:Number},
    "no_score":{type:Number},
    "is_win":{type:Number},
    //For Vendor
    "is_paid":{ type: Number},
    "is_s_pool_paid":{ type: Number},
    "no_pool":{ type: Number},
    "no_s_pool":{ type: Number},
    "is_active":{ type: Number},
    "is_publish":{ type: Number},
    "plyacc_ispaid":{ type: Number},
    "pzpool_ispaid":{ type: Number},
    "is_cancel_chk":{type:Number},
    "is_pool_cancel":{type:Number},
    "is_match_cancel":{type:Number},

    
    
    // "coaches": { type: Object },
    // "standings": { type: Object },
    // "assistants": { type: Object },
    // "leg": { type: String },
    // "colors": { type: Object },
    // "deleted": { type: Object },
    // "is_placeholder": { type: Object },
    // "lineup": { type: Object },
    // "bench": { type: Object },
    // "isplayer": { type: Number },//new
    // "localTeam": { type: Object },//new
    // "visitorTeam": { type: Object },//new
    // "status": { type: String },
    // "teama": { type: Object },
    // "teamb": { type: Object },
    // "is_active": { type: Number, default: 0 }, //Todo: dbkey removed
    // "is_publish": { type: Number, default: 0 }, // Rodo: dbkey removed
    // "is_allpublish": { type: Number, default: 0 },
    // "rstatus": { type: Number },
    // "is_playing11": { type: Number }

}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
});


const createFbUpcomingsModel = (connection) => {
    return connection.model("fb_upcomings", fbUpcomingsSchema);
};

module.exports = createFbUpcomingsModel;
