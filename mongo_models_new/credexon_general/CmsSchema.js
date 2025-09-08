const mongoose = require("mongoose");

const cmsSchema = mongoose.Schema({
    "title": { type: String },
    "slug": { type: String },
    "content": { type: String },
    "image": { type: String },
    "status": { type: Number },
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    })


// Add a virtual field for `id`
cmsSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createCmsModel = (connection) => {
    return connection.model("cms", cmsSchema);
};

module.exports = createCmsModel
