//const { ObjectId } = require("mongodb")
const { Double } = require("mongodb")
const mongoose = require("mongoose")

const cktSeriesTeamStatsBatSchema = mongoose.Schema({
    cid: { type: Number},
    matches: { type: Number },
    innings: { type: Number },
    notout:{ type: Number },
    runs:{ type: Number },
    balls:{ type: Number },
    highest:{ type: Number },
    run100:{ type: Number },
    run50:{ type: Number },
    run4: { type: Number },
    run6: { type: Number },
    average: { type: String }, 
    strike: { type: String },
    catches:{ type: Number },
    stumpings: { type: Number }, 
    updated: { type: String },
    fastest50balls: { type: Number },
    fastest100balls:{ type: Number },
    team: { type: Object },
    player: { type: Object }
    },
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('cktSeriesTeamBatStats', cktSeriesTeamStatsBatSchema, 'cktSeriesTeamBatStats')
