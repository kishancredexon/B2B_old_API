const mongoose = require("mongoose");

const userBankAccountsSchema = new mongoose.Schema(
    {
        userid: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true }, // Reference to Users collection
        bankname: { type: String, required: true },
        ifsccode: { type: String, required: true },
        acholdername: { type: String, required: true },
        acno: { type: String, required: true },
        isverified: { type: Number, default: 0 }, // SMALLINT equivalent
        image: { type: String },
        city: { type: String },
        state: { type: String },
        upi: { type: String }
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    }
);

// Add a virtual field for `id`
userBankAccountsSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createUserBankAccountsModel = (connection) => {
    return connection.model("user_bank_accounts", userBankAccountsSchema);
};

module.exports = createUserBankAccountsModel;
