"use strict";
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
console.log("process.env.NODE_ENV--->>>", process.env.NODE_ENV);
const env = process.env.NODE_ENV || "production";
//const config = require(__dirname + '/../config/config.json')[env];
const db = {};
// let dbnamejson = require("../helper/dbname.json");
// let dbName=Object.values(dbnamejson);

let sequelize = {};

////////////
let dbMain = {};
let configMain = {
  username: process.env.postgresusr,
  password: process.env.postgrespass,
  database: process.env.postgresdb,
  host: process.env.postgreshost,
  port: process.env.postgresport,
  dialect: "postgres",
  logging: false,
};
const sequelizemain = new Sequelize(
  configMain.database,
  configMain.username,
  configMain.password,
  configMain
);
const modelMain = require(path.join(__dirname, "masterusers.js"))(
  sequelizemain,
  Sequelize.DataTypes
);
dbMain["masterusers"] = modelMain;
dbMain.sequelize = sequelizemain;

global.gdbname = "";

let dbCheck = () => {
  return new Promise(async (resolve, reject) => {
    let mailFun = () => {
      return dbMain.masterusers
        .findAll({
          where: { status: 1 },
          attributes: ["apikey", "dbname"],
        })
        .then((query) => {
          let dbAll = {};
          query.map((itemDB) => {
            dbAll[itemDB.apikey] = itemDB.dbname;
          });

          return dbAll;
        });
    };

    let dbnamejson = await mailFun();
    let dbName = Object.values(dbnamejson);

    global.gdbname = dbnamejson;
    ////////////////

    dbName.forEach((itemDb, indexDb) => {
      configMain["database"] = itemDb;
      sequelize[itemDb] = new Sequelize(configMain);
    });

    dbName.forEach((itemDb) => {
      let dbModel = {};
      fs.readdirSync(__dirname)
        .filter((file) => {
          return (
            file.indexOf(".") !== 0 &&
            file !== basename &&
            file.slice(-3) === ".js"
          );
        })
        .forEach((file) => {
          const model = require(path.join(__dirname, file))(
            sequelize[itemDb],
            Sequelize.DataTypes
          );
          dbModel[model.name] = model;
        });
      db[itemDb] = dbModel;
    });

    dbName.forEach((itemDb) => {
      Object.keys(db[itemDb]).forEach((modelName) => {
        const model = db[itemDb][modelName];
        if (model.associate) {
          model.associate(db[itemDb]);
        }
      });
    });

    dbName.forEach((itemDb) => {
      db[itemDb]["sequelize"] = sequelize[itemDb];
    });
    //console.log("dbdbdb===>>",db)
    resolve(db);
  });
};

// Exporting a function that returns the db object
module.exports = async function () {
  return await dbCheck();
};
