const mongoose = require("mongoose")
const { useCLS } = require("sequelize")
const { SMALLINT } = require("sequelize")
const conn = require("../config/db")

const matchesSchema = mongoose.Schema({
    match_id: { type: String, required: true },
    game_id: { type: Integer, required: true },
    matchname: { type: String, required: true },
    team1: { type: String, required: true },
    team2: { type: String, required: true },
    team1logo: { type: String, required: true },
    team2logo: { type: String, required: true },
    gametype: { type: String, required: true },
    totalpoints: { type: Integer, required: true },
    mtype: { type: String, required: true },
    mdate: { type: Integer, required: true, default: 0 },
    status: { type: SMALLINT, required: true, default: 1 },
    mstatus: { type: String, required: true, default:uc,comment:'uc=upcomming\nli=live\ncm=complete\ndc=declared'},
    seriesid: { type: String, required: true },
    seriesname: { type: String, required: true },
    modified: { type: Integer, required: true }

},
    {
        timestamps: true
    })

let User = mongoose.model("Matches", matchesSchema)
