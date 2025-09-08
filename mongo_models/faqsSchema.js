const mongoose = require("mongoose");
const faqSchema = mongoose.Schema({
    "category_name": { type: String },
    "question": { type: String },
    "answer": { type: String },
},
    {
        timestamps: true,
        versionKey: false
    })

module.exports = mongoose.model('faq', faqSchema ,'faq')