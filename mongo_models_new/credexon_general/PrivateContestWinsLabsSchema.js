const mongoose = require("mongoose")

const privateContestWinsLabsSchema = mongoose.Schema({
    winner: { type: Number },
    ranks: { type: Array }
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });


// Add a virtual field for `id`
privateContestWinsLabsSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createPrivateContestWinsLabsModel = (connection) => {
    return connection.model("private_contest_wins_labs", privateContestWinsLabsSchema);
};

module.exports = createPrivateContestWinsLabsModel;
