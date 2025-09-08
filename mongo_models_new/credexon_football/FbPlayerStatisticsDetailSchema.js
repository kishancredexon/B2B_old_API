const mongoose = require("mongoose")

const fbPlayerStatisticsDetailSchema = new mongoose.Schema({
    "season_id": { type: Number },//
    "player_id": { type: Number },
    "league_id": { type: Number },
    "league_name": { type: String },
    "player_detail": { type: Object },


},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
fbPlayerStatisticsDetailSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createFbPlayerStatisticsDetailModel = (connection) => {
    return connection.model("fb_player_statistics_detail", fbPlayerStatisticsDetailSchema);
};

module.exports = createFbPlayerStatisticsDetailModel;
