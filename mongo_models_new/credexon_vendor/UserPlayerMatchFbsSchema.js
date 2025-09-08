const { ObjectID } = require("mongodb");
const mongoose = require("mongoose");

const userPlayerMatchFbsSchema = mongoose.Schema({
    // _id: { type: Object },
    pid: { type: Number },
    match_id: { type: Number },
    uteamid: { type: ObjectID },
    userid: { type: ObjectID },
    is_substitue: { type: Number, default: 0 },
    playing_role: { type: Number },
    mteam_id: { type: Number },
    //teama_count: { type: Number },
    //teamb_count: { type: Number },
    team_no: { type: Number }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
});

// Add a virtual field for `id`
userPlayerMatchFbsSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createUserPlayerMatchFbsModel = (connection) => {
    return connection.model("user_player_match_fbs", userPlayerMatchFbsSchema);
};

module.exports = createUserPlayerMatchFbsModel;
