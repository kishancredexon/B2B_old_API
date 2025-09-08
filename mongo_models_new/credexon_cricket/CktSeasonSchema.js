const mongoose = require("mongoose")

const cktSeasonSchema = mongoose.Schema({
    "sid": { type: String},
    "name":{ type: String},
    "competitions_url": { type: String}

},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
cktSeasonSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createCktSeasonModel = (connection) => {
    return connection.model("ckt_seasons", cktSeasonSchema);
};

module.exports = createCktSeasonModel;

