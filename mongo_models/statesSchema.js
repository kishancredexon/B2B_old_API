const mongoose = require("mongoose")
const { INTEGER } = require("sequelize")
const conn = require("../config/db")

// Todo: Not using
const statesSchema = mongoose.Schema({
    name: { type: String, required: true },
    country_id: { type: INTEGER, required: true },

},
    {
        timestamps: true,
        versionKey: false
    })

let User = mongoose.model("States", statesSchema)
