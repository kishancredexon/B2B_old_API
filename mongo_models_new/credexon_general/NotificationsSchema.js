const { ObjectId } = require("bson");
const mongoose = require("mongoose")

const notificationsSchema = mongoose.Schema({
    userid: { type: ObjectId },
    userids: { type: Array },
    enddate: { type: Date },
    isexpire: { type: Number, default: 1 },
    type: { type: String },//,Comment:'[auto_promotion, auto_win, auto_refund, auto_promocode, manual]' },
    title: { type: String },
    body: { type: String },
    isadmin: { type: Number, default: 0 }
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });


// Add a virtual field for `id`
notificationsSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createNotificationsModel = (connection) => {
    return connection.model("notifications", notificationsSchema);
};

module.exports = createNotificationsModel;
