const { ObjectId } = require("bson");
const mongoose = require("mongoose");

const bankDetailsSchema = mongoose.Schema({
    id:Number,
    userid: ObjectId,
    bankname: String,
    ifsccode: String,
    acholdername: String,
    acno: String,
    isverified: Number,
    image: String,
    city: String,
    state: String,
    upi: String,

  createdAt: Date,
  updatedAt: Date
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
  });


const createBankDetailsModel = (connection) => {
  return connection.model("bank_details", bankDetailsSchema);
};

module.exports = createBankDetailsModel;
