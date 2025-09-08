const mongoose = require("mongoose");

const settingSchema = mongoose.Schema({
    "bonus_amount": { type: Number },
    "usable_bonus_percentage": { type: Number },
    "full_address": { type: String },
    "team_acc": { type: Number },
    "player_acc": { type: Number },
    "prize_pool": { type: Number },
    "admin_commission": { type: Number },
    "platform_fees": { type: Number },
    "min_withdraw_amount": { type: Number },
    "max_withdraw_amount": { type: Number },
    "tds": { type: Number },
    "vat": { type: Number },
    "email": { type: String },
    "mobile": { type: String },
    "country_code": { type: String },
    "ref_bns_amt": { type: Number },
    "android_version": { type: String },
    "ios_version": { type: String },
    "add_amt_bonus_perc": { type: Number },
    "min_add_amount": { type: Number },
    "max_add_amount": { type: Number },
    "gst_addamount_percentage": { type: Number }
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    })

// Add a virtual field for `id`
settingSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createSettingsModel = (connection) => {
    return connection.model("setting", settingSchema);
};

module.exports = createSettingsModel;
