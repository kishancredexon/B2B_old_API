const mongoose = require("mongoose")

const cktteammetadataSchema = mongoose.Schema({
    "team_id": { type: Number },
    "logo_url": { type: String },
    "short_name": { type: String },
    "status": { type: Number }

},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('cktteammetadatas', cktteammetadataSchema, 'cktteammetadatas')

