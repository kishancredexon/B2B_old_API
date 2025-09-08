const mongoose = require("mongoose")

const fbcountriesSchema = mongoose.Schema({
    "id": { type: Number },
    "name": { type: String },
    "image_path": { type: String },
    "extra": { type: Object }

},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('fbcountries', fbcountriesSchema, 'fbcountries')

