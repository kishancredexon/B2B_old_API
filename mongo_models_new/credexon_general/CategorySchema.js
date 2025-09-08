const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
    "name": { type: String },
    "description": { type: String },
    "image": { type: String },
    "status": { type: Number },
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
categorySchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createCategoryModel = (connection) => {
    return connection.model("category", categorySchema);
};

module.exports = createCategoryModel;
