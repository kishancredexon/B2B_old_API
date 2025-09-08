const mongoose = require("mongoose");

const fbLeaguesPubSchema = mongoose.Schema({
    "id": { type: Number },
    "date_start": { type: Date },
    "date_end": { type: Date },
    "status": { type: String },
    "is_active": { type: Number, default: 0 },
    "is_publish": { type: Number, default: 0 },
}, {
    timestamps: true,
    versionKey: false,
    // toJSON: { virtuals: true }, // Include virtuals in JSON responses
    // toObject: { virtuals: true }, // Include virtuals in object responses
});

//Todo: Remove because id already exist
// Add a virtual field for `id`
// fbLeaguesPubSchema.virtual("id").get(function () {
//     return this._id.toHexString(); // Convert _id (ObjectId) to a string
// });

const createFbLeaguesPubModel = (connection) => {
    return connection.model("fb_leagues_publishes", fbLeaguesPubSchema);
};

module.exports = createFbLeaguesPubModel;
