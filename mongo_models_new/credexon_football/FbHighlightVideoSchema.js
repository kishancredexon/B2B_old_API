const mongoose = require("mongoose");

const fbHighlightVideoSchema = mongoose.Schema({
    "match_id": { type: Number },
    "hightlight_data": { type: Object }
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
fbHighlightVideoSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createFbHighlightVideoModel = (connection) => {
    return connection.model("fb_highlight_video", fbHighlightVideoSchema);
};

module.exports = createFbHighlightVideoModel;
