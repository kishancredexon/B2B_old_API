const mongoose = require("mongoose");

const cktIccRankingSchema = mongoose.Schema({
    rank: { type: String },
    player: { type: String },
    team: { type: String },
    rating: { type: String },
    points: { type: String },
    type: { type: String },
    player_type: { type: String }
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
cktIccRankingSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createCktIccRankingModel = (connection) => {
    return connection.model("ckt_icc_ranking", cktIccRankingSchema);
};

module.exports = createCktIccRankingModel;
