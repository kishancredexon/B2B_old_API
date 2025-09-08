const mongoose = require("mongoose")
const { INTEGER } = require("sequelize")
const { SMALLINT } = require("sequelize")
// const conn = require("../config/db")

const paymenttransactionSchema = mongoose.Schema({
    transaction_id: { type: String },
    account_id: { type: String },
    entity: { type: String },
    amount: { type: Number },
    currency: { type: String, required: true},
    status: { type: String, required: true },
    order_id: { type: String, required: true },
    invoice_id: { type: Number, required: true },
    international: { type: Boolean, required: true },
    method: { type: String, required: true},
    amount_refunded: { type: Number, required: true },
    refund_status: { type: Number, required: true },
    captured: { type: Boolean, required: true },
    description: { type: String, required: true },
    card_id: { type: Number, required: true},
    bank: { type: Number, required: true},
    },
    {
        timestamps: true
    })

let User = mongoose.model("paymenttransaction", paymenttransactionSchema)
