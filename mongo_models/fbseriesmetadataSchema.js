const mongoose = require("mongoose")

const fbseriesmetadataSchema = mongoose.Schema({
    // "team_id": { type: Number },
    "league_id": { type: Number },
    "logo_url": { type: String },
    "short_name": { type: String },
    "status": { type: Number }

},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('fbseriesmetadatas', fbseriesmetadataSchema, 'fbseriesmetadatas')
