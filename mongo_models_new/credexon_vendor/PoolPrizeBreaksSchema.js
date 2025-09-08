const mongoose = require("mongoose");
const { ObjectID } = require("mongodb")

const poolPrizeBreaksSchema = mongoose.Schema({
    pool_id: { type: ObjectID },
    pmin: { type: Number },
    pmax: { type: Number },
    pamount: { type: Number },
    ppbmaster_id: { type: ObjectID }
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
poolPrizeBreaksSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createPoolPrizeBreaksModel = (connection) => {
    return connection.model("pool_prize_breaks", poolPrizeBreaksSchema);
};

module.exports = createPoolPrizeBreaksModel;
