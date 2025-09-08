const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const downloadsSchema = mongoose.Schema({
    "clientkey": { type: String },
    "ip": { type: String },
    "os": { type: String },
    "os_version": { type: String },
    "browser": { type: String },
    "browser_version": { type: String },
    "status": { type: String },
    "country": { type: String },
    "countryCode": { type: String },
    "region": { type: String },
    "regionName": { type: String },
    "city": { type: String },
    "zip": { type: String },
    "lat": { type: String },
    "lon": { type: String },
    "timezone": { type: String },
    "isp": { type: String },
    "org": { type: String },
    "as": { type: String },
    "query": { type: String },
    "hitdate": { type: Date },
    "userid": { type: ObjectId }
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    })


// Add a virtual field for `id`
downloadsSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createDownloadsModel = (connection) => {
    return connection.model("downloads", downloadsSchema);
};

module.exports = createDownloadsModel
