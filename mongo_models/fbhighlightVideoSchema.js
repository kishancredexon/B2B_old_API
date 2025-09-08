const mongoose = require("mongoose");

const fbhighlightVideoSchema = mongoose.Schema({
    "match_id": { type: Number },
    "hightlight_data": { type: Object}
},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('fbhighlightvideo', fbhighlightVideoSchema,'fbhighlightvideo')
