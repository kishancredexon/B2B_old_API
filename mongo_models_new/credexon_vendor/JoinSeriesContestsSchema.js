const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const joinSeriesContestsSchema = mongoose.Schema({
    league_id: { type: Number },
    userid: { type: ObjectId },
    poolid: { type: ObjectId },
    uteamid: { type: ObjectId },
    //gamekey: { type: Number},
    pamount: { type: Number, default: 0 },
    totalpnt: { type: Number, default: 0 },
    winamt: { type: Number, default: 0 },
    gametype: { type: String }//ckt,fb
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
});

// Add a virtual field for `id`
joinSeriesContestsSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createSeriesJoinContestsModel = (connection) => {
    return connection.model("join_series_contests", joinSeriesContestsSchema);
};

module.exports = createSeriesJoinContestsModel;
