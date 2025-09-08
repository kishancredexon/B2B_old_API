const mongoose = require("mongoose");

const fbPlayersSchema = mongoose.Schema({
    "match_id": { type: Number },
    "tid": { type: Number },
    "pid": { type: Number },
    "jersey_number": { type: Number },
    "is_playing": { type: Number },
    "selectedBy": { type: Boolean },
    "league_id": { type: Number },
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
fbPlayersSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createFbPlayersModel = (connection) => {
    return connection.model("fb_players", fbPlayersSchema);
};

module.exports = createFbPlayersModel;
