const { ObjectID } = require("mongodb");
const mongoose = require("mongoose");

const userPlayersCktSchema = mongoose.Schema({
    // _id: { type: Object },
    pid: { type: Number },
    league_id: { type: Number },
    uteamid: { type: ObjectID },
    is_substitue: { type: Number, default: 0 },  //0 =not subsstitue 1= substitue
    userid: { type: ObjectID },
    playing_role: { type: String },
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
userPlayersCktSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createUserPlayersCktModel = (connection) => {
    return connection.model("user_players_series_ckts", userPlayersCktSchema);
};

module.exports = createUserPlayersCktModel;
