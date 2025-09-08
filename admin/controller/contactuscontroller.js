const { connectWithGeneralDb } = require("../../config/mongodb_connections");
const response = require("../../helper/response");
const createContactUsModel = require("../../mongo_models_new/credexon_general/ContactUsSchema");

let get_all_contact_us_requests = async (req, res) => {
    try {
        const generalDbConnection = await connectWithGeneralDb();
        const ContactUsSchema = createContactUsModel(generalDbConnection);

        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;

        const offset = (page - 1) * size;

        const [count_data, req_data] = await Promise.all([
            ContactUsSchema.countDocuments({}),
            ContactUsSchema.find({})
                .sort({ _id: -1 })
                .skip(offset)
                .limit(size)
        ]);

        return res.send(response({
            total_count: count_data,
            data: req_data,
            status: req_data && req_data.length > 0 ? true : false

        }, req_data.length > 0 ? "Contact view succesfully.!!!" : "No data found.!!!"))

    } catch (error) {
        return res.status(400).send(response([], "Something went wrong.!!!", false, null, error.stask));
    }
}

module.exports = {
    get_all_contact_us_requests: get_all_contact_us_requests
}
