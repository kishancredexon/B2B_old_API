const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
    name: String,
    createdAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
});

// Add a virtual field for `id`
testSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createTestModel = (connection) => {
    return connection.model("test", testSchema);
};

module.exports = createTestModel;
