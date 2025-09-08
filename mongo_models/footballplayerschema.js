const mongoose = require("mongoose");
const footballPlayersSchema =mongoose.Schema({
    "match_id" : {type:Number},   
    "tid" : {type:Number},
    "pid" : {type:Number},
    "jersey_number" : {type:Number}
    // "id" : {type:Number},
    // "date_start":{type:Date},
    // "team_id" :{type:Number},
    // "lineup" : {type:Object},
    // "bench" : {type:Object},
    // "squad": {type:Object},
    // "status" : {type:String}
},
    {
        timestamps: true,
        versionKey: false
    })
module.exports = mongoose.model("fbplayers", footballPlayersSchema)