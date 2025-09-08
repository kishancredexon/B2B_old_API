const { connectWithMasterDb } = require("../../config/mongodb_connections");
const response = require("../../helper/response");
const createMasterUsersModel = require("../../mongo_models_new/credexon_master/MasterUsersSchema");
const bcrypt = require("bcryptjs");

module.exports = {
    create_master_user: async (req, res) => {
        try {
            if (req.apiKey === "@@11##44masterU$$serKeyIsHere55YouHaveToFind##This") {
                var randomPassword = generateRandomPassword();
                const password = await bcrypt.hash(randomPassword, 10);
                const connection = await connectWithMasterDb();

                const MasterUsersSchema = createMasterUsersModel(connection);

                const masterUser = await MasterUsersSchema.create({
                    usertype: 1,
                    email: "admin2@gmail.com",
                    password: "$2a$10$OinRWHmOCp01JYsTEcRZZ.EI8EkGm2T5J4V8NrhqQgnJOA3K9BFP2",
                    apikey: "master",
                    dbname: "master_db",
                    status: 1,
                    name: "Master",
                    profilename: "Admin",
                    phone: "9910031513",
                    cricket: 1,
                    football: 1,
                    player_accumulator: 1,
                    player_contest: 1,
                });

                // await masterUser.save();

                res.send("Success", masterUser)
            }

        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    }
}
