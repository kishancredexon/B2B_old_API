const mongoose = require("mongoose");
const { ObjectID } = require("mongodb");

const userCktLeagueSchema = mongoose.Schema({
    userid: { type: ObjectID },
    league_id: { type: Number },
    contest_id:{ type: ObjectID }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
});

// Add a virtual field for `id`
userCktLeagueSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createUserCktSeriesTeamModel = (connection) => {
    return connection.model("user_ckt_series_team", userCktLeagueSchema);
};

module.exports = createUserCktSeriesTeamModel;
