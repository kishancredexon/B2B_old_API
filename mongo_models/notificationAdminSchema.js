const { ObjectId } = require("bson")
const mongoose = require("mongoose")

const notificationAdminSchema = mongoose.Schema({
    userids: { type: Number },
    notifid:{type:ObjectId}
},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model("notifications_admin", notificationAdminSchema)
