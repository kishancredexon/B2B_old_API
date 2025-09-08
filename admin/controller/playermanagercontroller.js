const response = require("../../helper/response");
const { connectWithCricketDb } = require("../../config/mongodb_connections");
const createCktPlayersModel = require("../../mongo_models_new/credexon_cricket/CktPlayersSchema");

module.exports = {
    playermanager_list: async (req, res, next) => {
        try {
            const cktDbConnection = await connectWithCricketDb();
            const CktPlayersSchema = createCktPlayersModel(cktDbConnection);

            let player_list = await CktPlayersSchema.find({},
                // { _id: 1, type: 1, image: 1, sequence: 1, status: 1 }
            )
            return res.send(response({ player_list }, "Banner created successfully.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    }
}
