const mongoose = require("mongoose")
const { DOUBLE } = require("sequelize")
const { INTEGER } = require("sequelize")
const { SMALLINT } = require("sequelize")
const conn = require("../config/db")

const userteamplayerSchema = mongoose.Schema({
    userid: { type: INTEGER, required: true},
    ppointid: { type: INTEGER, required: true },
    iscap: { type: SMALLINT, required: true },
    isvcap: { type: SMALLINT, required: true },
    fantasypoints: { type: INTEGER, required: true},
    winamt:{ type: DOUBLE, required: true},
   
},
    {
        timestamps: true
    })

let User = mongoose.model("Userteamplayer", userteamplayerSchema)
