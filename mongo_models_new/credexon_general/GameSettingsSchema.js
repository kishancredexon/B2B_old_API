const mongoose = require("mongoose");

const gameSettingsSchema = mongoose.Schema({
    "key": { type: String },
    "type": { type: String },
    "value": { type: Number },
    "name": { type: String },
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });


// Add a virtual field for `id`
gameSettingsSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createGameSettingsModel = (connection) => {
    return connection.model("game_settings", gameSettingsSchema);
};

module.exports = createGameSettingsModel;
