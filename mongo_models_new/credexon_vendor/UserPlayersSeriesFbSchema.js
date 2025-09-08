const { ObjectID } = require("mongodb");
const mongoose = require("mongoose");

const userPlayersFbSchema = mongoose.Schema({
    pid: { type: Number },
    league_id: { type: Number },
    uteamid: { type: ObjectID },
    is_substitue: { type: Number, default: 0 },      //0 =not subsstitue 1= substitue
    userid: { type: ObjectID },
    playing_role: { type: Number },
    mteam_id: { type: Number },
    team_count: { type: Object },
    team_no: { type: Number },
    match_ids: { type: Array },
    allmatch_id: { type: Array }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
});

// Add a virtual field for `id`
userPlayersFbSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createUserPlayersFbModel = (connection) => {
    return connection.model("user_players_series_fbs", userPlayersFbSchema);
};

module.exports = createUserPlayersFbModel;
