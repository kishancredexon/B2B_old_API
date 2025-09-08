const mongoose = require("mongoose")
const { INTEGER } = require("sequelize")
const conn = require("../config/db")

const countriesSchema = mongoose.Schema({
    shortname: { type: String, required: true },
    name: { type: String, required: true },
    phonecode: { type: String, required: true },

},
    {
        timestamps: true
    })

let User = mongoose.model("Countries", countriesSchema)



//npx sequelize-cli model:generate --name country --attributes country:string