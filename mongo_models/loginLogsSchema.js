const mongoose = require("mongoose");

const loginLogsSchema = mongoose.Schema({
    "userid": Number,
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
        versionKey: false
    })

module.exports = mongoose.model("loginlogs", loginLogsSchema)
