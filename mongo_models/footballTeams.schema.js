const mongoose = require("mongoose");

const footballTeamsSchema =mongoose.Schema({  
    "season_id":{type:Number},
    "league_id":{type:Number},
    "season_name":{type:String},
    "team_id" : {type:Number},   
    "legacy_id":{type:Number},
    "name" :{type:String},
    "short_code" : {type:String},
    "twitter" : {type:String},
    "country_id": {type:Number},
    "national_team" : {type:Boolean},
    "founded" : {type:Number},
    "logo_path" : {type:String},
    "venue_id" : {type:Number},
    "current_season_id" : {type:Number},
    "is_placeholder" : {type:Boolean},
    "squad" : {type:Object}
},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model("fbteams", footballTeamsSchema)