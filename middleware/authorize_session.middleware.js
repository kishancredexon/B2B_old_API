require('dotenv').config();

const jwt = require('jsonwebtoken');
const {
    secret,secretA
} = require('../config.json');

const {getDBName } = require('../helper/common');
const { connectWithVendorDb } = require('../config/mongodb_connections');
const createUsersModel = require('../mongo_models_new/credexon_vendor/UsersSchema');
const { ObjectId } = require('bson');

module.exports = async (authHeader,auth) => {
    return new Promise((resolve,reject)=>{
        //var authHeader = req.headers.authorization;
        //var current_timezone = req.headers.current_timezone;
        if(auth==1){
            if (authHeader) {
                authHeader = authHeader.replace('Bearer ', '')
                jwt.verify(authHeader, secret, async(err, result) => {
                    console.log("resultapikey--->>",result);
                    
                    //jwt.verify(result.token, secret, async(err, resultA) => {
                    
                        //console.log("errsocket===>>",err,resultA)
                    if (err) {
                        
                        return {
                            data: {},
                            message: 'Unauthorized 1 please login again!',
                            status: false,
                            status_code: 403
                        };
                    }
                    console.log("dbNameCHECK--->>",result);
                    //result.apikey=(result.apikey)?result.apikey:"master";
                    const dbName = await getDBName(result.apikey);
                    console.log("dbNameCHECK--->>",dbName);
                    
                    const vendorDbConnection = await connectWithVendorDb(dbName);
                    const UsersSchema = createUsersModel(vendorDbConnection);
                    
                    UsersSchema.findOne({_id: ObjectId(result.sub)}).lean().then((data) => {
                        if (!data)
                        resolve ({
                                data: {},
                                message: 'Unauthorized 2 please login again!',
                                status: false,
                                status_code: 403
                            });
                            //let dataF=data;
                            // dataF["timezone"]=result.timezone;
                            // dataF["apikey"]=result.apikey;
                            // dataF["dbName"] = dbName;
                            
                            // result.user = dataF;
                            
                            // console.log("dataFdataF===>>",dataF);

                            //////////
                            let dataF= data;
                            dataF["timezone"]=result?.timezone
                            dataF["apikey"]=result?.apikey
                            dataF["dbName"] = dbName;
                            let resultA={};
                            resultA.user = dataF;
                            resultA["dbName"] = dbName;
                            //////////
                            return resolve(resultA);
                            
                    });
                //});
                //////////////
            })
            } else {
                resolve ({
                    message: 'Unauthorized 3 please login again!',
                    status: false,
                    status_code: 403
                });
            }
        }else{
            if (authHeader) {
                authHeader = authHeader.replace('Bearer ', '')
                jwt.verify(authHeader, secretA, (err, result) => {
                    jwt.verify(result.token, secret, async(err, resultA) => {
                        console.log("resultA-->>",resultA)
                    if (err) {
                        
                        return {
                            data: {},
                            message: 'Unauthorized 1 please login again!',
                            status: false,
                            status_code: 403
                        };
                    }
                    
                    
                    //result.apikey=(result.apikey)?result.apikey:"master";
                    
                    const dbName = await getDBName(resultA.apikey);
                    const vendorDbConnection = await connectWithVendorDb(dbName);
                    const UsersSchema = createUsersModel(vendorDbConnection);
                    UsersSchema.findOne({_id: ObjectId(resultA.sub)}).lean().then((data) => {
                        
                        if (!data){
                            resolve ({
                                    data: {},
                                    message: 'Unauthorized 2 please login again!',
                                    status: false,
                                    status_code: 403
                                });
                        }
                            let dataF= data;
                            dataF["timezone"]=result?.timezone
                            dataF["apikey"]=resultA?.apikey
                            dataF["dbName"] = dbName;
                            
                            resultA.user = dataF;
                            resultA["dbName"] = dbName;
                            return resolve(resultA);
                            
                    });
                });
                //////////////
            })
            } else {
                resolve ({
                    message: 'Unauthorized 3 please login again!',
                    status: false,
                    status_code: 403
                });
            }
        }
    })
}