require('dotenv').config();
const {getDBName } = require('../helper/common');


module.exports = async (apikey) => {
    return new Promise(async(resolve,reject)=>{
                    const dbName = await getDBName(apikey);
                    return resolve({"user":{"apikey":apikey,"dbName":dbName},
                    "apikey":apikey,"dbName":dbName});
                });
}