const mongoose = require("mongoose");

const privateContestSizesSchema = mongoose.Schema({
    contestsize: { type: Number },
    winnerslabs: { type: Array }
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });


// Add a virtual field for `id`
privateContestSizesSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createPrivateContestSizesModel = (connection) => {
    return connection.model("private_contest_sizes", privateContestSizesSchema);
};

module.exports = createPrivateContestSizesModel;
