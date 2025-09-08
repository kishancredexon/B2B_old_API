const mongoose = require("mongoose");

const gameAccsSchema = mongoose.Schema({
    "gamekey": { type: String },
    "prize": { type: Number }
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
gameAccsSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createGameAccsModel = (connection) => {
    return connection.model("game_accs", gameAccsSchema);
};

module.exports = createGameAccsModel;
