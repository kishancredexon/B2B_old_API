const { ObjectID } = require("mongodb")
const mongoose = require("mongoose")
const conn = require("../config/mongodb")

const iccRankingSchema = mongoose.Schema({
    rank: { type: String},
    player: { type: String},
    team: { type: String},
    rating: { type: String},
    points: { type: String },
    type: { type: String},
    player_type: { type: String }
},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('iccranking', iccRankingSchema,'iccranking'  )

//jpoolmckt -> 