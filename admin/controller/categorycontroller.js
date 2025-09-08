const { connectWithGeneralDb } = require("../../config/mongodb_connections");
const response = require("../../helper/response");
const singleFileRequest = require("../../middleware/files.middleware");
const env = process.env;
const createCategoryModel = require("../../mongo_models_new/credexon_general/CategorySchema");

module.exports = {
    upsert_category: async (req, res) => {
        try {
            let data = req.body;
            let files = req.files;

            const generalDbConnection = await connectWithGeneralDb();
            const CategorySchema = createCategoryModel(generalDbConnection);

            data.status = 1;

            if (files && files.image) {
                const fileDetails = { files, img_name: files.image, folder_name: "profile_doc" };
                data.image = await singleFileRequest(fileDetails);
            }

            await CategorySchema.findOneAndUpdate(
                { name: data.name }, // Query condition
                { $set: data }, // Update operation
                { upsert: true, new: true } // Create if not exists, return updated doc
            );

            return res.send(response({}, `Data created successfully!`, true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    category_list: async (_, res) => {
        try {
            const generalDbConnection = await connectWithGeneralDb();
            const CategorySchema = createCategoryModel(generalDbConnection);

            let categoryList = await CategorySchema.find({}, { _id: 1, name: 1, image: 1, description: 1, }).lean().exec();

            const totalCount = await CategorySchema.estimatedDocumentCount();

            const updatedCategoryList = categoryList.map(item => ({
                ...item,
                image: isValidHttpUrl(item.image) ? item.image : `${env.awsimgurl}profile_doc/${item.image}`
            }));

            return res.send(response({
                total_count: totalCount,
                category_list: updatedCategoryList,
            }, "Data view successfully.!!!", true))

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },

}

const isValidHttpUrl = (string) => {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}