
const { connectWithVendorDb } = require('../../config/mongodb_connections');
const createPoolMasterModel = require('../../mongo_models_new/credexon_vendor/PoolMasterSchema');

const poolmasterdataFunction = async (data, req) => {
    return new Promise(async (resolve, reject) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const PoolMasterSchema = createPoolMasterModel(vendorDbConnection);

            data.is_save = false;
            let match = { contest_id: data.contest_id };
            await PoolMasterSchema.find(match).then((result) => {

                // let mota = JSON.stringify(result)
                data.poolmasterData = result[0]
                resolve(data)
            }).catch((err) => {
                return res.send(response({}, "Something went wrong.!!!", false))
                resolve(err);
            })

        } catch (e) {
            return res.send(response({}, "Something went wrong.!!!", false))

        }
    })
}

const stripHtml = (html) => {
    return html.replace(/<[^>]*>/g, '').trim();
};

const truncateText = (text, limit) => {
    return text.length > limit ? text.substring(0, limit) + "..." : text;
};

const cms_content_limit = (data) => {
    if (data.content) {
        const plainText = stripHtml(data.content);
        data.content = truncateText(plainText, 50);
    }

    return data;
}

module.exports = {
    poolmasterdataFunction, cms_content_limit
}
