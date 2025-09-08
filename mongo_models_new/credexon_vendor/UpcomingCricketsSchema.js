const mongoose = require("mongoose");

let upcomingCricketPublishSchema = mongoose.Schema({
    "match_id": { type: Number },
    "date_start_ist": { type: Date },
    "rstatus": { type: Number },
    "is_active": { type: Number, default: 0 },
    "is_publish": { type: Number, default: 0 },
    "is_paid": { type: Number }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
});

// Add a virtual field for `id`
upcomingCricketPublishSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createUpcomingCricketPublishModel = (connection) => {
    return connection.model("crickets_upcoming_publishes", upcomingCricketPublishSchema);
};

module.exports = createUpcomingCricketPublishModel;
