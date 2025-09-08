const response = require("../../helper/response");
const cmsSchema = require("../../mongo_models/cmsSchema");
const env = process.env;
const { connectWithGeneralDb } = require("../../config/mongodb_connections");
const createSettingsModel = require("../../mongo_models_new/credexon_general/SettingSchema");
const createCategoryModel = require("../../mongo_models_new/credexon_general/CategorySchema");
const createFaqModel = require("../../mongo_models_new/credexon_general/FaqSchema");

module.exports = {
    cms_list: async (req, res, next) => {
        try {
            const params = req.body
            const cmsView = await cmsSchema(req.user.apikey).findOne({
                slug: (params.slug)

            }, { _id: 1, title: 1, slug: 1, content: 1 })

            return res.send(response(cmsView, "CMS find successfully.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    category_list: async (req, res, next) => {
        try {
            const generalDbConnection = await connectWithGeneralDb();
            const CategorySchema = createCategoryModel(generalDbConnection);

            let category_list = await CategorySchema.find({}, { _id: 1, name: 1, image: 1, description: 1, }).lean();
            category_list = category_list.map((item, i) => {
                let checkhttpurl = isValidHttpUrl(item.image)
                if (checkhttpurl) {
                    item.image = item.image
                } else {
                    item.image = `${env.awsimgurl}profile_doc/${item.image}`
                }
                return (item)
            })

            let total_count = await CategorySchema.countDocuments();
            return res.send(response({
                total_count: total_count,
                category_list: category_list,
            }, "Data view successfully.!!!", true))

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    web_setting: async (_, res,) => {
        try {
            const connection = await connectWithGeneralDb();
            const SettingSchema = createSettingsModel(connection);

            let settings = await SettingSchema.findOne({})
            //  console.log("settingssettings",settings.ref_bns_amt);
            return res.send(response({
                android_version: settings.android_version,
                ios_version: settings.ios_version
            }, "Data view successfully.!!!", true))

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },

    faq_list: async (req, res, next) => {
        try {
            const generalDbConnection = await connectWithGeneralDb();
            const FaqSchema = createFaqModel(generalDbConnection);

            //  let data = req.body;
            let limit = (req.query.page) ? parseInt(req.query.limit) : 10;
            let page = (req.query.page) ? parseInt(req.query.page) : 0;
            let skip = page * limit;
            // limit and pagination 
            let where = {}
            if (req.body.category_name) {
                where = { category_name: req.body.category_name }
            }

            let faq_list = await FaqSchema.find(where, { category_name: 1, answer: 1, question: 1 }).skip(skip).limit(limit)

            //count 
            let total_count = await FaqSchema.countDocuments(where)
            return res.send(response({
                total_count: total_count,
                faq_list: faq_list,
            }, faq_list.length > 0 ? "FAQ view succesfully.!!!" : "No data found.!!!", true))

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
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