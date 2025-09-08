const mongoose = require("mongoose")

const footballTeamsFantasySchema = new mongoose.Schema({
    "season_id": { type: Number },
    "league_id": { type: Number },
    "match_id": { type: Number },
    "team_id": { type: Number },
    "plycnt": { type: Number, default: 0 },
    "tp": { type: Number, default: 0 },
},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model("fbteamfantpoints", footballTeamsFantasySchema)