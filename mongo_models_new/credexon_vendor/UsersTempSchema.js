const mongoose = require("mongoose");

const usersTempSchema = mongoose.Schema({
  country_code: String,
  phone: String,
  email: String,
  otp: String,
  refercode: String,
  ip: String,
  password: String,
  socialid: String,
  logintype: String,
  referred_by: String,
  referred_status: String,
  devicetoken: String,
  devicetype: String,
  usertype: Number,
  socialtype: { type: Number, default: 0 }, // Default status = 0
  createdAt: Date,
  updatedAt: Date
},
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
  });

// Add a virtual field for `id`
usersTempSchema.virtual("id").get(function () {
  return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createUsersTempModel = (connection) => {
  return connection.model("usertemps", usersTempSchema);
};

module.exports = createUsersTempModel;
