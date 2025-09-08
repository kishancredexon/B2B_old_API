const mongoose = require("mongoose");

const footballPlayersSchema =mongoose.Schema({  
    "match_id" : {type:Number},   
    "date_start":{type:Date},
    "teama" :{type:Object},
    "teamb" : {type:Object},
    "status" : {type:String},
    "season_id": {type:Number}
   
},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model("fbplayers", footballPlayersSchema,"fbplayers")