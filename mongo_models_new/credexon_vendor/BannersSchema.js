const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
    "type": { type: String },
    "image": { type: String },
    "sequence": { type: Number },
    "status": { type: Number },
    "device": { type: String },
    "banner_link": { type: String }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
});

// Add a virtual field for `id`
bannerSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createBannerModel = (connection) => {
    return connection.model("banner", bannerSchema);
};

module.exports = createBannerModel;
