const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const loginLogsSchema = mongoose.Schema({
    "userid": ObjectId,
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
    "hitdate": { type: Date }
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });


// Add a virtual field for `id`
loginLogsSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createLoginLogsModel = (connection) => {
    return connection.model("login_logs", loginLogsSchema);
};

module.exports = createLoginLogsModel;
