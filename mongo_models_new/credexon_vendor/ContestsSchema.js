const mongoose = require("mongoose");

const contestsSchema = mongoose.Schema({
    contest_id: { type: String },
    title: { type: String },
    subtitle: { type: String },
    contestlogo: { type: String },
    status: { type: Number, default: 1 },
    dis_val: { type: Number, default: 0 },
    dis_type: { type: String },
    max_dis_val: { type: Number },
    favcontest: { type: Number, default: 0 },
    isprivate: { type: Number, default: 0 },
    sortodr: { type: Number, default: 2 },
    order: { type: Number, default: 0 },
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
contestsSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createContestsModel = (connection) => {
    return connection.model("contests", contestsSchema);
};

module.exports = createContestsModel;
