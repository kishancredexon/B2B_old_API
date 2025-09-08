const mongoose = require("mongoose");

const cricketTeamsSchema = mongoose.Schema({
    "cid": { type: Number },
    "squad_type": { type: String },
    "team_id": { type: Number },
    "title": { type: String },
    "gmdate": { type: Date },
    "players": { type: Array },
    "team": { type: Object }
},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model("cktteams", cricketTeamsSchema)