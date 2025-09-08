const mongoose = require("mongoose");

const gameSettingsSchema = mongoose.Schema({
    "key": { type: String },
    "type": { type: String },
    "value": { type: Number },
    "name": { type: String },

},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model("gamesettings", gameSettingsSchema)