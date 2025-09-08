'use strict';
const mongoose = require('mongoose');

//To remove the deprecation warning
mongoose.set('useFindAndModify', false);
let connectMongo = function () {
  mongoose.pluralize(null);
  return new Promise((resolve, reject) => mongoose.connect(process.env.DB_CONNECTION_STRING,
    {
      user: process.env.mongousr, pass: process.env.mongopass,//LIVE
      //user: 'credexon', pass: 'Rp@Rucn1%9y',//DEV
      dbName: "credexon_master",
      useNewUrlParser: true, useUnifiedTopology: true
    })
    .then(yes => {
      resolve('conneted mongo', yes)
    })
    .catch(err => {
      reject('not connected', err)
    }));
}

let getObjectID = function (ID) {
  return mongoose.Types.ObjectId(ID);
}

module.exports = { connectMongo, getObjectID }
