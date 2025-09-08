const mongoose = require("mongoose")
const { FLOAT } = require("sequelize")
const { INTEGER } = require("sequelize")
const conn = require("../config/db")

const multibaggerwinSchema = mongoose.Schema({
    userid: { type: String, required: true },
    mbid: { type: String, required: true },
    winamt: { type: FLOAT, required: true },

},
    {
        timestamps: true
    })

let User = mongoose.model("Multibaggerwin", multibaggerwinSchema)
