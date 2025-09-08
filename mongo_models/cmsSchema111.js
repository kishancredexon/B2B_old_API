const mongoose = require("mongoose");

const bannerSchema = mongoose.Schema({
    "type": { type: String },
    "image": { type: String },
    "sequence": { type: Number },
    "status": { type: Number },

},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model("banners", bannerSchema)