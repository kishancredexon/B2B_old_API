const mongoose = require("mongoose");

const citiesSchema = mongoose.Schema({
    "id": { type: Number },
    "name": { type: String },
    "country": { type: String },
    "state": { type: String },
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    })

const createCitiesModel = (connection) => {
    return connection.model("cities", citiesSchema);
};

module.exports = createCitiesModel
