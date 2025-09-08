const mongoose = require("mongoose")

const vendorFbTeamMetaDatasSchema = mongoose.Schema({
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
vendorFbTeamMetaDatasSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createVendorFbTeamMetaDatasModel = (connection) => {
    return connection.model("fb_team_meta_datas", vendorFbTeamMetaDatasSchema);
};

module.exports = createVendorFbTeamMetaDatasModel;
