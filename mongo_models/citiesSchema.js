const mongoose = require("mongoose")
const { INTEGER } = require("sequelize")
const conn = require("../config/db")

const citiesSchema = mongoose.Schema({
    name: { type: String, required: true },
    state_id: { type: INTEGER, required: true },
    id: { type: INTEGER, required: true },
},
    {
        timestamps: true,
        versionKey: false
    })

let User = mongoose.model("Cities", citiesSchema)
