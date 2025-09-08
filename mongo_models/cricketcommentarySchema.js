const mongoose = require("mongoose");

const cricketcommentarySchema =mongoose.Schema({  
     "cid":{ type: Number},
     "match_id": { type: Number},
     "innings":{type:Object},
     "match":{type:Object},
     "inning":{type:Object},
     "commentaries":{type:Object},
     "teams":{type:Object},
     "players":{type:Object},
},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('cricketcommentary', cricketcommentarySchema ,'cricketcommentary')