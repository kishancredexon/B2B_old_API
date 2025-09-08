'use strict';
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { connectWithVendorDb, connectWithGeneralDb } = require("../../config/mongodb_connections");
const createUsersModel = require("../../mongo_models_new/credexon_vendor/UsersSchema");
const createStateModel = require("../../mongo_models_new/credexon_general/StateSchema");
const createCitiesModel = require("../../mongo_models_new/credexon_general/CitiesSchema");
const { ObjectId } = require("bson");
const createBankDetailsModel = require("../../mongo_models_new/credexon_vendor/BankDetailsSchema");
const createTransactionsModel = require("../../mongo_models_new/credexon_vendor/TransactionsSchema");





async function importCSVCreateUsers() {
    try {
        const csvFilePath = path.join(__dirname, "./../../data/db/users.csv"); // Change this to your file path
        const dbName = "crdxn";
              const vendorDbConnection = await connectWithVendorDb(dbName);
              const UsersSchema = createUsersModel(vendorDbConnection);

       const records = [];

        // Read CSV file
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on("data", (row) => {
                records.push(row);
            })
            .on("end", async () => {
                if (records.length > 0) {
                    const sortedData = records.sort((a, b) => a.id - b.id);
                    sortedData.forEach(async (item,index)=>{
                     let objData={};
                         let keysArray = Object.keys(item);
                   
                        keysArray.forEach(async itemKey=>{
                            objData[itemKey]=(item[itemKey]=="NULL")?null:item[itemKey];
                            
                        })

                        //--------FOR Create START----------// 
                        await UsersSchema.create(objData);
                        //--------FOR Create END----------//

                        
                 })
                 
                } else {
                    console.log("No records found in CSV file");
                }
                
            });
    } catch (err) {
        console.error("Error:", err);
    }
}


async function importCSVUpdateUserprofile() {
    try {
        const csvFilePath = path.join(__dirname, "./../../data/db/userprofiles.csv"); // Change this to your file path
        const dbName = "crdxn";
              const vendorDbConnection = await connectWithVendorDb(dbName);
              const UsersSchema = createUsersModel(vendorDbConnection);

              const generalDbConnection = await connectWithGeneralDb();
              const CitiesSchema = createCitiesModel(generalDbConnection);
              const StatesSchema = createStateModel(generalDbConnection);

              let getCities=await CitiesSchema.find({});
              let objCity={};
              getCities.forEach(itemCity=>{
                objCity[itemCity.id]=itemCity._id;
              })

              let getState=await StatesSchema.find({});
              let objState={};
              getState.forEach(itemState=>{
                objState[itemState.id]=itemState._id;
              })

       const records = [];

        // Read CSV file
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on("data", (row) => {
                records.push(row);
            })
            .on("end", async () => {
                if (records.length > 0) {
                    const sortedData = records.sort((a, b) => a.id - b.id);
                    sortedData.forEach(async (item,index)=>{
                     let objData={};
                         let keysArray = Object.keys(item);
                   
                        keysArray.forEach(async itemKey=>{
                            if(itemKey=="stateid"){
                                objData[itemKey]=(item[itemKey]=="NULL")?null:ObjectId(objState[item[itemKey]]);
                            }else
                            if(itemKey=="cityid"){
                                objData[itemKey]=(item[itemKey]=="NULL")?null:ObjectId(objCity[item[itemKey]]);
                            }else
                            {
                                objData[itemKey]=(item[itemKey]=="NULL")?null:item[itemKey];
                            }
                            
                            
                        })

                         //--------FOR Update START----------//
                         delete objData["id"];
                         await UsersSchema.updateOne({"id":parseInt(item.userid)},objData);
                        //--------FOR Update END----------//
                 })
                  
                } else {
                    console.log("No records found in CSV file");
                }
                
            });
    } catch (err) {
        console.error("Error:", err);
    }
}

async function importCSVCreateStates() {
    try {
        const csvFilePath = path.join(__dirname, "./../../data/db/states.csv"); // Change this to your file path
        const generalDbConnection = await connectWithGeneralDb();
        const StatesSchema = createStateModel(generalDbConnection);

       const records = [];

        // Read CSV file
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on("data", (row) => {
                records.push(row);
            })
            .on("end", async () => {
                if (records.length > 0) {
                    const sortedData = records.sort((a, b) => a.id - b.id);
                    sortedData.forEach(async (item,index)=>{
                     let objData={};
                         let keysArray = Object.keys(item);
                   
                        keysArray.forEach(async itemKey=>{
                            objData[itemKey]=(item[itemKey]=="NULL")?null:item[itemKey];
                            
                        })

                        //--------FOR Create START----------// 
                        await StatesSchema.create(objData);
                        //--------FOR Create END----------//

                        
                 })
                 
                } else {
                    console.log("No records found in CSV file");
                }
                
            });
    } catch (err) {
        console.error("Error:", err);
    }
}

async function importCSVCreateCity() {
    try {
        const csvFilePath = path.join(__dirname, "./../../data/db/city.csv"); // Change this to your file path
        const generalDbConnection = await connectWithGeneralDb();
        const CitiesSchema = createCitiesModel(generalDbConnection);

       const records = [];

        // Read CSV file
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on("data", (row) => {
                records.push(row);
            })
            .on("end", async () => {
                if (records.length > 0) {
                    const sortedData = records.sort((a, b) => a.id - b.id);
                    sortedData.forEach(async (item,index)=>{
                     let objData={};
                         let keysArray = Object.keys(item);
                   
                        keysArray.forEach(async itemKey=>{
                            objData[itemKey]=(item[itemKey]=="NULL")?null:item[itemKey];
                            
                        })

                        //--------FOR Create START----------// 
                        await CitiesSchema.create(objData);
                        //--------FOR Create END----------//

                        
                 })
                 
                } else {
                    console.log("No records found in CSV file");
                }
                
            });
    } catch (err) {
        console.error("Error:", err);
    }
}

async function importCSVCreateUserbankaccounts() {
    try {
        const csvFilePath = path.join(__dirname, "./../../data/db/Userbankaccounts.csv"); // Change this to your file path
        const dbName = "crdxn";
              const vendorDbConnection = await connectWithVendorDb(dbName);
              const UsersSchema = createUsersModel(vendorDbConnection);
              const BankDetailsSchema=createBankDetailsModel(vendorDbConnection);

              let getUserDetail=await UsersSchema.find({});

              let getUserId={};
              getUserDetail.forEach(itemUser=>{
                getUserId[itemUser.id]=itemUser._id;
              })

       const records = [];

        // Read CSV file
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on("data", (row) => {
                records.push(row);
            })
            .on("end", async () => {
                if (records.length > 0) {
                    const sortedData = records.sort((a, b) => a.id - b.id);
                    sortedData.forEach(async (item,index)=>{
                     let objData={};
                         let keysArray = Object.keys(item);
                   
                        keysArray.forEach(async itemKey=>{
                            //objData[itemKey]=(item[itemKey]=="NULL")?null:item[itemKey];
                            if(itemKey=="userid"){
                                objData[itemKey]=(item[itemKey]=="NULL")?null:ObjectId(getUserId[item[itemKey]]);
                            }else
                            {
                                objData[itemKey]=(item[itemKey]=="NULL")?null:item[itemKey];
                            }
                            
                        })

                        //--------FOR Create START----------// 
                        await BankDetailsSchema.create(objData);
                        //--------FOR Create END----------//

                        
                 })
                 
                } else {
                    console.log("No records found in CSV file");
                }
                
            });
    } catch (err) {
        console.error("Error:", err);
    }
}

async function importCSVCreateTransactions() {
    try {
        const csvFilePath = path.join(__dirname, "./../../data/db/Transactions.csv");
        const dbName = "crdxn";

        const vendorDbConnection = await connectWithVendorDb(dbName);
        const UsersSchema = createUsersModel(vendorDbConnection);
        const TransactionsSchema = createTransactionsModel(vendorDbConnection);

        // Fetch users and map their IDs
        let getUserDetail = await UsersSchema.find({});
        let getUserId = {};
        getUserDetail.forEach(user => {
            getUserId[user.id] = user._id;
        });

        let records = [];
        let batchSize = 10000;
        let batchIndex = 0;

        // Read CSV file in chunks
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on("data", (row) => {
                records.push(row);
            })
            .on("end", async () => {
                if (records.length > 0) {
                    const sortedData = records.sort((a, b) => a.id - b.id);

                    async function processBatch(startIndex) {
                        if (startIndex >= sortedData.length) {
                            console.log("All records processed.");
                            return;
                        }

                        let batch = sortedData.slice(startIndex, startIndex + batchSize);
                        let bulkOperations = [];

                        batch.forEach(item => {
                            let objData = {};
                            Object.keys(item).forEach(itemKey => {
                                if (itemKey === "userid") {
                                    objData[itemKey] = item[itemKey] === "NULL" ? null : ObjectId(getUserId[item[itemKey]]);
                                } else if (itemKey === "jpoolid") {
                                    objData[itemKey] = item[itemKey] === "NULL" ? null : ObjectId(item[itemKey]);
                                } else {
                                    objData[itemKey] = item[itemKey] === "NULL" ? null : item[itemKey];
                                }
                            });

                            bulkOperations.push(objData);
                        });

                        await TransactionsSchema.insertMany(bulkOperations);
                        
                        batchIndex++;
                        setTimeout(() => processBatch(startIndex + batchSize), 20000); // Wait 20 seconds
                    }

                    processBatch(0);
                } else {
                    console.log("No records found in CSV file");
                }
            });
    } catch (err) {
        console.error("Error:", err);
    }
}

async function importCSVUpdateTransactionsTId() {
    try {
        const csvFilePath = path.join(__dirname, "./../../data/db/Transactions.csv");
        const dbName = "crdxn";

        const vendorDbConnection = await connectWithVendorDb(dbName);
        const TransactionsSchema = createTransactionsModel(vendorDbConnection);

        // Fetch Transactions and map their IDs
        let getTransactionsDetail = await TransactionsSchema.find({});
        let getUTransactionsId = {};
        getTransactionsDetail.forEach(trans => {
            getUTransactionsId[trans.id] = trans._id;
        });

        const records = [];

        // Read CSV file
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on("data", (row) => {
                records.push(row);
            })
            .on("end", async () => {
                if (records.length > 0) {
                    
                    const filterData = records.filter(x=>x["tid"]!="NULL");

                    filterData.forEach(async itemTras=>{
                        await TransactionsSchema.updateOne({"id":itemTras.id},{"$set":{"tid":getUTransactionsId[itemTras.tid]}});
                    });
                }
            })


        // let findTid= await TransactionsSchema.find({tid:{"$ne":null}});
        // findTid.forEach(async itemTras=>{
        //     await TransactionsSchema.updateOne({"id":itemTras.id},{"$set":{"tids":getUTransactionsId[itemTras.tid]}});
        // })
        
        
    } catch (err) {
        console.error("Error:", err);
    }
}





//importCSVCreateUsers();
//importCSVCreateStates();
//importCSVCreateCity();
//importCSVUpdateUserprofile();
//importCSVCreateUserbankaccounts();
//importCSVCreateTransactions()
//importCSVUpdateTransactionsTId();