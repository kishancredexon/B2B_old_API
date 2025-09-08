const mongoose = require("mongoose")
const conn = require("../config/db")

const gamesSchema = mongoose.Schema({
    gname: { type: String, required: true },
    gtype: { type: Integer, required: true },
    title: { type: String, required: true },
    icon: { type: String, required: true }

},
    {
        timestamps: true
    })

let User = mongoose.model("Games", gamesSchema)
