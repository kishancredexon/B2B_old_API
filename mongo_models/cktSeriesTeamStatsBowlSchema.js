//const { ObjectId } = require("mongodb")
const { Double } = require("mongodb")
const mongoose = require("mongoose")

const cktSeriesTeamStatsBowlSchema = mongoose.Schema({
    cid: { type: Number},
    matches: { type: Number },
    innings: { type: Number },
    balls:{ type: Number },
    overs:{ type: String },
    runs:{ type: Number },
    wickets:{ type: Number },
    bestinning:{ type: String },
    bestmatch:{ type: String },
    econ: { type: String },
    average: { type: String },
    strike: { type: String }, 
    wicket4i: { type: Number },
    wicket5i:{ type: Number },
    wicket10m: { type: Number }, 
    updated: { type: String },
    maidens: { type: Number },
    hattrick:{ type: Number },
    expensive_over_runs: { type: Number },
    Aaverage: { type: String },
    team: { type: Object },
    player: { type: Object }
    },
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('cktSeriesTeamBowlStats', cktSeriesTeamStatsBowlSchema, 'cktSeriesTeamBowlStats')
