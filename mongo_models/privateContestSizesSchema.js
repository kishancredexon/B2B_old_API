const mongoose = require("mongoose")
const conn = require("../config/mongodb")

const privateContestSizesSchema = mongoose.Schema({
    contestsize: { type: Number},
    winnerslabs: { type: Array}
},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model("privatecontestsizes", privateContestSizesSchema ,'privatecontestsizes' )
