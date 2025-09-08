const mongoose = require("mongoose");

const transactionsDocSchema = new mongoose.Schema(
  {
    trans_id: { type: Object, required: true },
    payment_id: { type: String, required: true },
    amount: { type: mongoose.Types.Decimal128, required: true },
    currency: { type: String, required: true },
    order_id: { type: String, required: true },
    method: { type: String, required: true },
    vpa: { type: String },
    transaction_id: { type: String, required: true },
    created_at: { type: Number, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
  }
);

transactionsDocSchema.index({ trans_id: 1 }, { unique: true });

// Add a virtual field for `id`
transactionsDocSchema.virtual("id").get(function () {
  return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createTransactionsDocModel = (connection) => {
  return connection.model("transactions_doc", transactionsDocSchema);
};

module.exports = createTransactionsDocModel;
