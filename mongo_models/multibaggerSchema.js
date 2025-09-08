const mongoose = require("mongoose")
const { INTEGER } = require("sequelize")
const conn = require("../config/db")

const multibaggerSchema = mongoose.Schema({
    matchid: { type: String, required: true },
    playerid: { type: String, required: true },
    pricepershare: { type: String, required: true },
    fantasypoints: { type: INTEGER, required: true },

},
    {
        timestamps: true
    })

let User = mongoose.model("Multibagger", multibaggerSchema)
