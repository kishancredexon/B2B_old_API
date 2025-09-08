let sdb = require("../../models");
const response = require("../../helper/response");
const { connectWithGeneralDb } = require("../../config/mongodb_connections");
const createStateModel = require("../../mongo_models_new/credexon_general/StateSchema");

module.exports = {
    state_list: async (_, res) => {
        try {
            const generalDbConnection = await connectWithGeneralDb();
            const StatesSchema = createStateModel(generalDbConnection);

            const state_list = await StatesSchema.find({
                country: "India"
            }, {
                id: "$_id", name: 1, status: 1, updatedAt: 1
            }).lean();

            return res.send(response({ state_list }, "City list find successfully!!!.", true));
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    state_list_edit: async (req, res) => {
        try {
            const generalDbConnection = await connectWithGeneralDb();
            const StatesSchema = createStateModel(generalDbConnection);

            const params = req.body

            await StatesSchema.updateOne({ _id: params.id }, { $set: { status: params.status } });

            const message = params.status == 1 ? "State Activated Successfully!!!" : "State Deactivated Successfully!!!";

            return res.send({ status: true, data: {}, message });
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
}