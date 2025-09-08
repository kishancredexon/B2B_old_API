const mongoose = require("mongoose")
const { useCLS } = require("sequelize")
const { SMALLINT } = require("sequelize")
const conn = require("../config/db")

const matchmasterSchema = mongoose.Schema({
    unique_id: { type: String, required: true },
    mdate: { type: String, required: true },
    dateTimeGMT: { type: String, required: true },
    team1: { type: String, required: true },
    team2: { type: String, required: true },
    matchStarted: { type: String, required: true,default: 0 },
    isactive: { type: SMALLINT, required: true,default: 0  },
    game_id: { type: Integer, required: true,default: 1 },
    name: { type: String, required: true },
    seasonkey: { type: String, required: true },
    status: { type: SMALLINT, required: true},
    seriesname: { type: String, required: true},
    

},
    {
        timestamps: true
    })

let User = mongoose.model("Matchmaster", matchmasterSchema)
