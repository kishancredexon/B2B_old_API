//const { ObjectId } = require("mongodb")
const { Double } = require("mongodb")
const mongoose = require("mongoose")

const fbSeriesTeamStatsSchema = mongoose.Schema({
    id: { type: Number},
    name: { type: String },
    league_id: { type: Number },
    is_current_season:{ type: Boolean },
    current_round_id:{ type: Number },
    current_stage_id:{ type: Number },
    goalscorers: { type: Object },
    assistscorers: { type: Object },
    cardscorers: { type: Object },
    },
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('fbSeriesTeamStats', fbSeriesTeamStatsSchema, 'fbSeriesTeamStats')
