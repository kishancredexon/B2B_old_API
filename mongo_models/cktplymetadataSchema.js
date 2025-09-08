const mongoose = require("mongoose")

const cktplymetadataSchema = mongoose.Schema({
    "pid": { type: Number },
    "logo_url": { type: String },
    "jersy_no": { type: Number },
    "status":{ type: Number },
    "avg_point": { type: Number, default: 0 }

},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('cktplymetadatas', cktplymetadataSchema, 'cktplymetadatas')

