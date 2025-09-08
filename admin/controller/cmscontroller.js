const { ObjectId } = require("mongodb");
const response = require("../../helper/response");
const { cms_content_limit } = require("../model/contestmodel");
const { connectWithGeneralDb } = require("../../config/mongodb_connections");
const createCmsModel = require("../../mongo_models_new/credexon_general/CmsSchema");

module.exports = {
    cms_list: async (req, res) => {
        try {
            const generalDbConnection = await connectWithGeneralDb();
            const CmsSchema = createCmsModel(generalDbConnection);

            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const page = req.query.page ? parseInt(req.query.page) : 0;
            const skip = page * limit;

            let cmsList = await CmsSchema.find({}, { _id: 1, title: 1, slug: 1, content: 1 })
                .skip(skip).limit(limit).lean();

            await cmsList.map((item) => cms_content_limit(item))

            let totalCount = await CmsSchema.countDocuments();

            return res.send(response({
                total_count: totalCount,
                cms_list: cmsList,
            }, cmsList.length > 0 ? "CMS view succesfully.!!!" : "No data found.!!!", true))

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    cms_view: async (req, res) => {
        try {
            const generalDbConnection = await connectWithGeneralDb();
            const CmsSchema = createCmsModel(generalDbConnection);

            const { cms_id } = req.body;

            const cmsView = await CmsSchema.findById(cms_id, { _id: 1, title: 1, slug: 1, content: 1 }).lean();

            return res.send(response(cmsView, "CMS find successfully.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    cms_update: async (req, res) => {
        try {
            const generalDbConnection = await connectWithGeneralDb();
            const CmsSchema = createCmsModel(generalDbConnection);

            const { cms_id, title, slug, content } = req.body;

            await CmsSchema.updateOne(
                { _id: ObjectId(cms_id) },
                { $set: { title, slug, content } }
            );

            return res.send(response({}, "cms updated succesfully !!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    create_cms: async (req, res) => {
        try {
            const generalDbConnection = await connectWithGeneralDb();
            const CmsSchema = createCmsModel(generalDbConnection);

            const { title, slug, content } = req.body;

            const existingCms = await CmsSchema.findOne({ title });
            if (existingCms) {
                throw new Error('Title is already taken.');
            }

            await CmsSchema.create({ title, slug, content });

            return res.send(response({}, "Cms created successfully.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    }
}