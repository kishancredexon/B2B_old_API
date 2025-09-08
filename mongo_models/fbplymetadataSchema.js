const mongoose = require("mongoose")

const fbplymetadataSchema = mongoose.Schema({
    "pid": { type: Number },
    "logo_url": { type: String },
    "jersy_no": { type: Number },
    "status": { type: Number },
    "avg_point": { type: Number, default: 0 }

},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('fbplymetadatas', fbplymetadataSchema, 'fbplymetadatas')

