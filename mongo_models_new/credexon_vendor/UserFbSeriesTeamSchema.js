const mongoose = require("mongoose");
const { ObjectID } = require("mongodb");

const userFbLeagueSchema = mongoose.Schema({
    userid: { type: ObjectID },
    league_id: { type: Number },
    contest_id: { type: ObjectID },
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
});

// Add a virtual field for `id`
userFbLeagueSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createUserFbLeagueModel = (connection) => {
    return connection.model("user_fb_league", userFbLeagueSchema);
};

module.exports = createUserFbLeagueModel;
