const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const transactionsSchema = mongoose.Schema(
  {
    id: Number,
    userid: { type: ObjectId },
    amount: { type: Number, default: 0 }, // Default status = 0
    txid: String,
    status: String,
    txdate: Number,
    docid: Number,
    ttype: String,
    atype: String,
    wit: String,
    prebal: Number,
    curbal: Number,
    jpoolid: ObjectId,
    gtype: String,
    order_id: String,
    trans_status: String,
    tid: ObjectId,
    bonusbal: { type: Number, default: 0 }, // Default status = 0
    bnstring: String,
    createdAt: Date,
    updatedAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
  }
);

transactionsSchema.index({ userid: 1 });
transactionsSchema.index({ trans_status: 1 });
transactionsSchema.index({ userid: 1, _id: 1, trans_status: 1 });
transactionsSchema.index({ amount_deposite: -1 });
transactionsSchema.index({ createdAt: -1 });

const createTransactionsModel = (connection) => {
  return connection.model("transactions", transactionsSchema);
};

module.exports = createTransactionsModel;
