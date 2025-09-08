const mongoose = require("mongoose");

const footballcommentarySchema = mongoose.Schema({
    "league_id": { type: Number },
    "match_id": { type: Number },
    "commentaries": { type: Object },
},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('footballcommentary', footballcommentarySchema, 'footballcommentary')