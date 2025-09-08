const mongoose = require("mongoose");

const stateSchema = mongoose.Schema({
    "id": { type: Number },
    "name": { type: String },
    "country": { type: String },
    "status": { type: Number },
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    })


const createStateModel = (connection) => {
    return connection.model("states", stateSchema);
};

module.exports = createStateModel
