
const response = require("../../helper/response");
const { connectWithGeneralDb } = require("../../config/mongodb_connections");
const createFaqModel = require("../../mongo_models_new/credexon_general/FaqSchema");


module.exports = {
    create_faq: async (req, res) => {
        try {
            const generalDbConnection = await connectWithGeneralDb();
            const FaqSchema = createFaqModel(generalDbConnection);

            const { category_name, question, answer } = req.body;

            await FaqSchema.create({ category_name, question, answer });

            return res.send(response({}, `FAQ created successfully!`, true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    faq_list: async (req, res) => {
        try {
            const generalDbConnection = await connectWithGeneralDb();
            const FaqSchema = createFaqModel(generalDbConnection);

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const [faqList, totalCount] = await Promise.all([
                FaqSchema.find({}, { category_name: 1, answer: 1, question: 1 }).skip(skip).limit(limit).lean(),
                FaqSchema.countDocuments()
            ]);

            return res.send(response({
                total_count: totalCount,
                faq_list: faqList,
            }, faqList.length > 0 ? "FAQ view succesfully.!!!" : "No data found.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    faq_update: async (req, res) => {
        try {
            const generalDbConnection = await connectWithGeneralDb();
            const FaqSchema = createFaqModel(generalDbConnection);

            const { faq_id, category_name, question, answer } = req.body;

            const updateData = {};
            if (category_name) updateData.category_name = category_name;
            if (question) updateData.question = question;
            if (answer) updateData.answer = answer;

            await FaqSchema.updateOne({ _id: faq_id }, { $set: updateData }, { upsert: true });

            return res.send(response({}, `Faq updated successfully!`, true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    }
}