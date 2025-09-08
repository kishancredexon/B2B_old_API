//const { ObjectId } = require("mongodb")
const { Double } = require("mongodb")
const mongoose = require("mongoose")

const fbSeriesTeamSchema = mongoose.Schema({
    id: { type: Number},
    name: { type: String },
    league_id: { type: Number },
    season_id:{ type: Number },
    round_id:{ type: Number },
    round_name:{ type: Number },
    type: { type: String },
    stage_id: { type: Number },
    stage_name: { type: String },
    resource: { type: String },
    standings: { type: Object }
    },
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('fbSeriesTeam', fbSeriesTeamSchema,'fbSeriesTeam')
