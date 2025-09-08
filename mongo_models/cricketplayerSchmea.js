const mongoose = require("mongoose");

const cricketPlayersSchema =mongoose.Schema({  
    "match_id":{ type: Number},
    "teama":{ type: Object},
    "teamb":{ type: Object},
    "playing11":{ type: Object},
    "is_playing11":{ type: Number},//0=Not playing, 1= Playing
    "avg_point":{ type: Number}
},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('cricketsplayers', cricketPlayersSchema,'cricketsplayers')

//  "is_playing": 2 = not decided
// 1= playing
//0 = not playing