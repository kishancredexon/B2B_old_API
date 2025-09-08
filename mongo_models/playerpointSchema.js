const mongoose = require("mongoose")
const { INTEGER } = require("sequelize")
const { SMALLINT } = require("sequelize")
const conn = require("../config/db")

const playerpointSchema = mongoose.Schema({
    matchid: { type: String, required: true },
    playerid: { type: String, required: true },
    isplaying: { type: SMALLINT, required: true },
    playertype: { type: String, required: true },
    fantasypoints: { type: INTEGER, required: true},
   
},
    {
        timestamps: true
    })

let User = mongoose.model("Playerpoint", playerpointSchema)
