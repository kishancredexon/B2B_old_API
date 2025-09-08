
const { connectWithVendorDb } = require('../../config/mongodb_connections');
const createPoolModel = require('../../mongo_models_new/credexon_vendor/PoolSchema');

//Todo: Not using
const pooldataFunction = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const PoolSchema = createPoolModel(vendorDbConnection);

            data.is_save = false;
            let match = { contest_id: data.contest_id };
            await PoolSchema.find(match).then((result) => {

                // let mota = JSON.stringify(result)
                data.poolData = result[0]
                // console.log(mota,"resultdata")
                resolve(data)
            }).catch((err) => {
                resolve(err);
            })

        } catch (e) {

            console.log('catch user save classified pages list', e);
        }
    })
}

module.exports = {
    poolmasterdataFunction
}
