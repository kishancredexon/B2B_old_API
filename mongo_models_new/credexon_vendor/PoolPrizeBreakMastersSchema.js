const mongoose = require("mongoose");
const { ObjectID } = require("mongodb");

const poolPrizeBreakMastersSchema = mongoose.Schema({
    poolmaster_id: { type: ObjectID },
    pmin: { type: Number },
    pmax: { type: Number },
    pamount: { type: Number },
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
poolPrizeBreakMastersSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createPoolPrizeBreakMastersModel = (connection) => {
    return connection.model("pool_prize_break_masters", poolPrizeBreakMastersSchema);
};

module.exports = createPoolPrizeBreakMastersModel;
