const mongoose = require("mongoose");

const fbCommentarySchema = mongoose.Schema({
    "league_id": { type: Number },
    "match_id": { type: Number },
    "commentaries": { type: Object },
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
fbCommentarySchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createFbCommentaryModel = (connection) => {
    return connection.model("fb_commentary", fbCommentarySchema);
};

module.exports = createFbCommentaryModel;
