const mongoose = require("mongoose")

const vendorCktPlayerMetaDataSchema = mongoose.Schema({
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

vendorCktPlayerMetaDataSchema.index({ pid: 1 });

// Add a virtual field for `id`
vendorCktPlayerMetaDataSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createVendorCktPlayerMetaDataModel = (connection) => {
    return connection.model("ckt_player_meta_data", vendorCktPlayerMetaDataSchema);
};

module.exports = createVendorCktPlayerMetaDataModel;
