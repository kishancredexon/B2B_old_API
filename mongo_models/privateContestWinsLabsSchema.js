const mongoose = require("mongoose")
const conn = require("../config/mongodb")
const privateContestWinsLabsSchema = mongoose.Schema({
    winner: { type: Number},
    ranks: { type: Array}
},
    {
        timestamps: true,
        versionKey: false
    })
module.exports = mongoose.model("privatecontestwinslabs", privateContestWinsLabsSchema ,'privatecontestwinslabs' )