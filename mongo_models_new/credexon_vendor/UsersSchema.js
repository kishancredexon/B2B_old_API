const { ObjectId } = require("bson");
const mongoose = require("mongoose");

const usersSchema = mongoose.Schema({
  phone: String,
  email: String,
  password: String,
  usertype: Number,  //0=admin 1=subadmin 2 =user
  country_code: String,
  refercode: String,
  referred_by: String,
  referred_status: String,
  referalShareCount: Number,
  otp: String,
  status: { type: Number, default: 1 }, // Default status = 1
  ip: String,
  browser: String,
  devicetoken: String,
  devicetype: String,
  logintype: { type: String },
  socialid: String,
  walletbalance: { type: Number, default: 0 }, // Default status = 0
  wltwin: { type: Number, default: 0 }, // Default status = 0
  totalwin: { type: Number, default: 0 }, // Default status = 0
  wltbns: { type: Number, default: 0 }, // Default status = 0
  wltdept: { type: Number, default: 0 }, // Default status = 0
  welbns: { type: Number, default: 0 }, // Default status = 0
  logindate: { type: Number, default: 0 }, // Default status = 0
  isbankdverify: { type: Number, default: 0 }, // Default status = 0
  ispanverify: { type: Number, default: 0 }, // Default status = 0
  isphoneverify: { type: Number, default: 0 }, // Default status = 0
  isemailverify: { type: Number, default: 0 }, // Default status = 0
  istnameedit: { type: Number, default: 0 },
  modified: { type: Number, default: 1 }, // Default status = 1
  isCompleteProfile: { type: Number, default: 0 }, // Default status = 0
  isVerifed: { type: Number, default: 0 }, // Default status = 0
  socialtype: { type: Number, default: 0 }, // Default status = 0
  referalShareCount: { type: Number, default: 0 }, // Default status = 0
  welbns: { type: Number, default: 0 }, // Default status = 0
  subadminmodule_status: String,
  wltwithdraw: { type: Number, default: 0 }, // Default status = 0
  totaljoinfee: { type: Number, default: 0 }, // Default status = 0
  totaljoinfeedepots: { type: Number, default: 0 }, // Default status = 0
  isIds: { type: Number, default: 0 }, // Default status = 0
  totaltds: { type: Number, default: 0 }, // Default status = 0
  wltbaltds: { type: Number, default: 0 }, // Default status = 0
  emailOtp: String,
  username: String,
  name: String,
  teamname: String,
  gender: String,
  dob: Number,
  address: String,
  cityid: Number,
  stateid: Number,
  countryid: Number,
  pincode: String,
  profilepic: String,
  lat: String,
  long: String,
  persona_id: String,
  persona_status: String,
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
// usersSchema.virtual("id").get(function () {
//   return this._id.toHexString(); // Convert _id (ObjectId) to a string
// });

usersSchema.index({ email: 1 });
usersSchema.index({ phone: 1 });

const createUsersModel = (connection) => {
  return connection.model("users", usersSchema);
};

module.exports = createUsersModel;
