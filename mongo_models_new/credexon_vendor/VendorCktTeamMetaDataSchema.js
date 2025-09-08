const mongoose = require("mongoose")

const vendorCktTeamMetaDataSchema = mongoose.Schema({
    "team_id": { type: Number },
    "logo_url": { type: String },
    "short_name": { type: String },
    "status": { type: Number }
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
vendorCktTeamMetaDataSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createVendorCktTeamMetaDataModel = (connection) => {
    return connection.model("ckt_team_meta_data", vendorCktTeamMetaDataSchema);
};

module.exports = createVendorCktTeamMetaDataModel;
