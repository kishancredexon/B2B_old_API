const { connectWithVendorDb } = require("../../config/mongodb_connections");
const response = require("../../helper/response");
const singleFileRequest = require("../../middleware/files.middleware");
const env = process.env;
const createBannerModel = require("../../mongo_models_new/credexon_vendor/BannersSchema");

module.exports = {
    banner_save: async (req, res) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const BannerSchema = createBannerModel(vendorDbConnection);

            const params = req.body

            await BannerSchema.create(params);

            return res.send(response({}, "Banner created successfully.!!!"))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    banner_list: async (req, res) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const BannerSchema = createBannerModel(vendorDbConnection);

            let bannerList = await BannerSchema.find({}, {
                _id: 1, type: 1, image: 1, sequence: 1, status: 1, device: 1, banner_link: 1
            }).lean();

            const updatedBannerList = bannerList.map(item => ({
                ...item,
                image: isValidHttpUrl(item.image) ? item.image : `${env.awsimgurl}profile_doc/${item.image}`
            }));

            return res.send(response({ banner_list: updatedBannerList }, "Banner created successfully.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    banner_edit: async (req, res) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const BannerSchema = createBannerModel(vendorDbConnection);

            let data = req.body;
            let files = req.files;
            let updateArray = { type: data.type };

            if (data.sequence) {
                updateArray.sequence = data.sequence;
            }

            if (data.status) {
                updateArray.status = data.status;
            }

            if (data.device) {
                updateArray.device = data.device;
            }
            if (data.banner_link) {
                updateArray.banner_link = data.banner_link;
            }

            if (Object.keys(files).length > 0) {
                let fileDetails = { files, img_name: files.image, folder_name: "profile_doc" };
                updateArray.image = await singleFileRequest(fileDetails);
            }

            if (data.banner_id && data.banner_id !== 'undefined') {
                await BannerSchema.updateOne({ _id: data.banner_id }, { $set: updateArray }, { "upsert": true })
            } else {
                await BannerSchema.create(updateArray)
            }

            return res.send({ status: true, data: {}, message: "Updated Successfully" })
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    }
}


const isValidHttpUrl = (string) => {
    //return new Promise((resolve, reject) => {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
    // })
}