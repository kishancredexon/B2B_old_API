const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const userBonusSchema = mongoose.Schema({
    transid: ObjectId,
    userid: ObjectId,
    atype: String,
    expiry_date: Number,
    txdate: Number,
    amount: { type: Number, default: 0 }, // Default status = 0,
    balamt: { type: Number, default: 0 }, // Default status = 0,
    createdAt: Date,
    updatedAt: Date,

},
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
  });

// Add a virtual field for `id`
userBonusSchema.virtual("id").get(function () {
  return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createUserBonusModel = (connection) => {
  return connection.model("user_bonus", userBonusSchema);
};

module.exports = createUserBonusModel;
