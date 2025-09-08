const response = require("../../helper/response");
const createGameSettingsModel = require("../../mongo_models_new/credexon_general/GameSettingsSchema");
const { connectWithGeneralDb } = require("../../config/mongodb_connections");
const createGameAccsModel = require("../../mongo_models_new/credexon_general/GameAccsSchema");
const createSettingsModel = require("../../mongo_models_new/credexon_general/SettingSchema");

module.exports = {
    setting_upsert: async (req, res) => {
        try {
            const connection = await connectWithGeneralDb();
            const GameSettingsSchema = createGameSettingsModel(connection);
            const GameAccsSchema = createGameAccsModel(connection);
            const SettingSchema = createSettingsModel(connection);

            let data = req.body;
            const allowedFields = [
                "bonus_amount", "usable_bonus_percentage", "full_address", "team_acc",
                "player_acc", "prize_pool", "admin_commission", "platform_fees",
                "min_withdraw_amount", "tds", "email", "mobile", "country_code",
                "ref_bns_amt", "android_version", "ios_version", "add_amt_bonus_perc",
                "gst_addamount_percentage"
            ];

            const filteredData = Object.keys(data)
                .filter(key => allowedFields.includes(key))
                .reduce((obj, key) => ({ ...obj, [key]: data[key] }), {});

            if (data.email) {
                await SettingSchema.updateOne({ "email": data.email }, { $set: filteredData }, { "upsert": true })
            }

            const bulkUpdates = [];

            if (data.team_acc) bulkUpdates.push({ updateOne: { filter: { gamekey: "tmacc" }, update: { $set: { prize: data.team_acc } } } });
            if (data.prize_pool) bulkUpdates.push({ updateOne: { filter: { gamekey: "pzpool" }, update: { $set: { prize: data.prize_pool } } } });
            if (data.player_acc) bulkUpdates.push({ updateOne: { filter: { gamekey: "plyacc" }, update: { $set: { prize: data.player_acc } } } });

            if (bulkUpdates.length > 0) await GameAccsSchema.bulkWrite(bulkUpdates);

            const gameSettingsUpdates = [];

            if (data.admin_commission) gameSettingsUpdates.push({ updateOne: { filter: { key: "platformfee" }, update: { $set: { value: data.admin_commission } } } });
            if (data.usable_bonus_percentage) gameSettingsUpdates.push({ updateOne: { filter: { key: "bnsused" }, update: { $set: { value: data.usable_bonus_percentage } } } });
            if (data.tds) gameSettingsUpdates.push({ updateOne: { filter: { key: "tdsperamt" }, update: { $set: { value: data.tds } } } });

            if (gameSettingsUpdates.length > 0) await GameSettingsSchema.bulkWrite(gameSettingsUpdates);

            return res.send(response({}, `Data created successfully!`, true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },

    setting_view: async (_, res) => {
        try {
            const connection = await connectWithGeneralDb();
            const SettingSchema = createSettingsModel(connection);

            const settingView = await SettingSchema.findOne({}, { _id: "$_id", bonus_amount: 1, usable_bonus_percentage: 1, full_address: 1, team_acc: 1, player_acc: 1, prize_pool: 1, admin_commission: 1, platform_fees: 1, min_withdraw_amount: 1, tds: 1, email: 1, mobile: 1, country_code: 1, ref_bns_amt: 1, android_version: 1, ios_version: 1, add_amt_bonus_perc: 1, gst_addamount_percentage: 1 })
            return res.send(response(settingView, "Data find successfully.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    }
}