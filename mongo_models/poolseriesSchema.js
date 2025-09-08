const mongoose = require("mongoose")
const conn = require("../config/mongodb")

const poolseriesSchema = mongoose.Schema({
    poolseries_id: { type: String },
    game_id:{ type: String },
    series_id: { type: String },
    contest_id: { type: String },
    poolmaster_id: { type: String },
    ispublish: { type: Number, default: 0 },
    iscancel: { type: Number, default: 0 },
    c: { type: String },
    ispoolfull:{ type: Number, default: 1 }

},
    {
        timestamps: true
    })

let Poolseries = mongoose.model("Poolseries", poolseriesSchema)
module.exports = Poolseries