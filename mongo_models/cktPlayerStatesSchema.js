//const { ObjectId } = require("mongodb")
const mongoose = require("mongoose")

const cktPlayerStatesSchema = mongoose.Schema({
    pid: { type: Number},
    batting: { type: Object },
    bowling: { type: Object },
},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('cktPlayerStates', cktPlayerStatesSchema,'cktPlayerStates')



