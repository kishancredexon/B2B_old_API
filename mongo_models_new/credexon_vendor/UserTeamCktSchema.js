const mongoose = require("mongoose");
const { ObjectID } = require("mongodb");

const userTeamCktSchema = mongoose.Schema({
    // _id: { type: Object },
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
userTeamCktSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createUserTeamCktModel = (connection) => {
    return connection.model("user_team_ckt", userTeamCktSchema);
};

module.exports = createUserTeamCktModel;
