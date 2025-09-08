const mongoose = require("mongoose")

const VendorFbPlayersMetaDataSchema = mongoose.Schema({
    "pid": { type: Number },
    "logo_url": { type: String },
    "jersy_no": { type: Number },
    "status": { type: Number },
    "avg_point": { type: Number, default: 0 }
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
VendorFbPlayersMetaDataSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createVendorFbPlayersMetaDataModel = (connection) => {
    return connection.model("fb_players_meta_data", VendorFbPlayersMetaDataSchema);
};

module.exports = createVendorFbPlayersMetaDataModel;
