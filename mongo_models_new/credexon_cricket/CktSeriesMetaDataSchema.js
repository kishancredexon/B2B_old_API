const mongoose = require("mongoose")

const cktSeriesMetaDataSchema = mongoose.Schema({
    // "team_id": { type: Number },
    "league_id": { type: Number },
    "logo_url": { type: String },
    "short_name": { type: String },
    "status": { type: Number }

},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
cktSeriesMetaDataSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createCktSeriesMetaDataModel = (connection) => {
    return connection.model("ckt_series_meta_data", cktSeriesMetaDataSchema);
};

module.exports = createCktSeriesMetaDataModel;
