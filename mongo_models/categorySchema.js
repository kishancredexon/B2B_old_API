const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
    "name": { type: String },
    "description": { type: String },
    "image": { type: String }, 
    "status": { type: Number },
    
},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model("category", categorySchema)