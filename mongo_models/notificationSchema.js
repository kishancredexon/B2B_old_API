const mongoose = require("mongoose")

const notificationSchema = mongoose.Schema({
    userid: { type: Number },
    userids: { type: Number },
    enddate:{type:Date},
    isexpire:{type:Number,default:1},
    type: { type: String},//,Comment:'[auto_promotion, auto_win, auto_refund, auto_promocode, manual]' },
    title: { type: String },
    body: { type: String },
    isadmin:{type:Number,default:0}
},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model("notifications", notificationSchema)
