const mongoose = require("mongoose");

const gameAccsSchema =mongoose.Schema({  
    "gamekey":{ type: String},
    "prize":{ type: Number}
},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model("gameaccs", gameAccsSchema)
