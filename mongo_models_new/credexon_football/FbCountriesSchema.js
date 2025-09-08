const mongoose = require("mongoose")

const fbCountriesSchema = mongoose.Schema({
    "id": { type: Number },
    "name": { type: String },
    "image_path": { type: String },
    "extra": { type: Object }
},
    {
        timestamps: true,
        versionKey: false,
        // toJSON: { virtuals: true }, // Include virtuals in JSON responses
        // toObject: { virtuals: true }, // Include virtuals in object responses
    });

//Todo: Remove because id already exist
// Add a virtual field for `id`
// fbCountriesSchema.virtual("id").get(function () {
//     return this._id.toHexString(); // Convert _id (ObjectId) to a string
// });

const createFbCountriesModel = (connection) => {
    return connection.model("fb_countries", fbCountriesSchema);
};

module.exports = createFbCountriesModel;
