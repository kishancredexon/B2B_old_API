const mongoose = require("mongoose");

//Todo: Need to manage because we are using this as a vendor basis in APIs
const fantasyPointsSchema = new mongoose.Schema({
    game_id: { type: Number, required: true },
    type: { type: String, required: true },
    points: { type: Object }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
});

// Add a virtual field for `id`
fantasyPointsSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createFantasyPointsModel = (connection) => {
    return connection.model("fantasy_points", fantasyPointsSchema);
};

module.exports = createFantasyPointsModel;
