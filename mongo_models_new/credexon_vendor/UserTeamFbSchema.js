const mongoose = require("mongoose");
const { ObjectID } = require("mongodb");

const userTeamFbSchema = mongoose.Schema({
    userid: { type: ObjectID },
    match_id: { type: Number },
    team_no: { type: Number },
    team_count:{ type: Object },
    player_role_count:{ type: Object }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
});

// Add a virtual field for `id`
userTeamFbSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createUserTeamFbModel = (connection) => {
    return connection.model("user_team_fb", userTeamFbSchema);
};

module.exports = createUserTeamFbModel;
