const mongoose = require("mongoose")

const playerstaticsdetailSchema =new mongoose.Schema({
    "season_id": { type: Number },//
    "player_id": { type: Number },
    "league_id":{ type: Number },
    "league_name":{ type: String },
    "player_detail": { type: Object },
    

},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('fbplayerstaticsdetail', playerstaticsdetailSchema, 'fbplayerstaticsdetail')
