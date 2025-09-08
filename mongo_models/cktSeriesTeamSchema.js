const mongoose = require("mongoose")

const cktSeriesTeamSchema = mongoose.Schema({
    cid: { type: Number },
    team_id: { type: Number },
    played: { type: Number },
    win: { type: Number },
    loss: { type: Number },
    draw: { type: Number },
    nr: { type: String },
    overfor: { type: String },
    runfor: { type: String },
    overagainst: { type: String },
    runagainst: { type: String },
    netrr: { type: String },
    points: { type: Number },
    lastfivematch: { type: String },
    lastfivematchresult: { type: String },
    quality: { type: Boolean },
    team: { type: Object }
},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('cktSeriesTeam', cktSeriesTeamSchema, 'cktSeriesTeam')
