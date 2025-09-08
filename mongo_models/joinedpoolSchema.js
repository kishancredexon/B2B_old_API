const mongoose = require("mongoose")
const conn = require("../config/mongodb")


const joinedpoolSchema = mongoose.Schema({
    pool_id: { type: Number },
    series_id: { type: Number },
    userid: { type: Number },
    status: { type: Number, default: 1 },  ///[status=(upcoming=1, live=2, result=3, Cancelled=4)]
    points: { type: Number },
    winamt: { type: Number },  ///[if winning 10000<=, 6% TDS will be deducted]

},
    {
        timestamps: true
    })

let joinedpool = mongoose.model("joinedpool", joinedpoolSchema,"joinedpool")
module.exports = joinedpool

