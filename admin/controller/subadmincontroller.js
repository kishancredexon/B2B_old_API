const response = require("../../helper/response");
const config = require("../../config.json");
const bcrypt = require("bcryptjs");
const { connectWithVendorDb } = require("../../config/mongodb_connections");
const createUsersModel = require("../../mongo_models_new/credexon_vendor/UsersSchema");

//Todo: But i think subadmin should shift to master table
module.exports = {
    subadmin_create: async (req, res) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UsersSchema = createUsersModel(vendorDbConnection);

            const params = req.body;

            // Check if email or phone already exists using `$or` for efficiency
            const existingUser = await UsersSchema.findOne({
                $or: [{ email: params.email }, { phone: params.phone }]
            });

            if (existingUser) {
                const message = existingUser.email === params.email
                    ? "Email already exists."
                    : "Phone number already exists.";
                return res.status(400).send(response({}, message, false));
            }

            if (params.password) {
                params.password = await bcrypt.hash(params.password, 10);
            }

            const subadminmodule_status = params.module_data ? JSON.stringify(params.module_data) : "[]";

            let createData = {
                subadminmodule_status,
                password: params.password,
                name: params.name,
                email: params.email,
                usertype: params.usertype,
                country_code: params.country_code,
                phone: params.phone,
                dob: params.dob,
                gender: params.gender
            }

            await UsersSchema.create(createData);

            return res.send(response({}, `Subadmin Created Successfully.!`, true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    subadmin_list: async (req, res) => {
        try {
            const dbName = req.user.dbName;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UsersSchema = createUsersModel(vendorDbConnection);

            const size = req.query.size ? parseInt(req.query.size) : 10;
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const { email, phone, name } = req.body;

            let filter = { usertype: config.role.subadmin };

            if (email || phone) {
                filter.$or = [];
                if (email) filter.$or.push({ email });
                if (phone) filter.$or.push({ phone });
            }

            if (name) {
                filter.name = { $regex: new RegExp(name, "i") }; // Case-insensitive regex match
            }

            const [subAdminList, total_count] = await Promise.all([
                UsersSchema.find(filter)
                    .select("phone email usertype country_code status createdAt password name dob gender") // Selecting required fields
                    .sort({ createdAt: -1 }) // Sorting by latest created first
                    .skip((page - 1) * size) // Implementing pagination
                    .limit(size) // Limiting the number of results
                    .lean(), // Converting Mongoose document to plain JS object for better performance

                UsersSchema.countDocuments({ ...filter, usertype: config.role.subadmin }) // Counting documents with filters
            ]);

            //Todo: Need to check why id is not append
            const updatedSubAdminList = subAdminList.map((subAdmin) => ({
                ...subAdmin,
                user_profile: {
                    name: subAdmin.name || "",
                    dob: subAdmin.dob || "",
                    gender: subAdmin.gender || ""
                },
                id: subAdmin._id
            }))

            return res.send(response({
                total_count: total_count,
                subadmin_list: updatedSubAdminList,
            }, "Data found succesfully.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    activeInactive_subadmin: async (req, res) => {
        try {
            const { dbName } = req.user;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UsersSchema = createUsersModel(vendorDbConnection);

            const { userid, status } = req.body;

            const updateResult = await UsersSchema.updateOne({ _id: userid }, { $set: { status } });

            if (updateResult.modifiedCount === 0) {
                return res.send({ status: false, data: {}, message: "Data is not Update", });
            }

            const message = status == 1
                ? "Subadmin Active Successfully!!!"
                : "Subadmin Deactive Successfully!!!";

            return res.send({ status: true, data: {}, message });
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    delete_subadmin: async (req, res) => {
        try {
            const { dbName } = req.user;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UsersSchema = createUsersModel(vendorDbConnection);

            const params = req.query;

            const user = await UsersSchema.findById(params.userid);

            if (!user) {
                return res.status(400).send(response({}, "User does not exist", false));
            }

            await UsersSchema.deleteOne({ _id: params.userid });

            return res.send(response({}, "Subadmin deleted successfully.", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    update_subadmin: async (req, res) => {
        try {
            const { dbName } = req.user;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UsersSchema = createUsersModel(vendorDbConnection);

            let params = req.body;

            let updateFields = {};

            if (params.name) updateFields.name = params.name;
            if (params.email) updateFields.email = params.email;
            if (params.country_code) updateFields.country_code = params.country_code;
            if (params.phone) updateFields.phone = params.phone;
            if (params.dob) updateFields.dob = params.dob;
            if (params.gender) updateFields.gender = params.gender;

            // Hash password if provided
            if (params.password) {
                updateFields.password = await bcrypt.hash(params.password, 10);
            }

            // Handle module_data conversion
            if (params.module_data) {
                updateFields.subadminmodule_status = JSON.stringify(params.module_data);
            }

            // Update user document in MongoDB
            await UsersSchema.updateOne({ _id: params.userid }, { $set: updateFields });

            return res.send(response({}, `Subadmin Update successfully.!`, true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    },
    subadmin_view: async (req, res) => {
        try {
            const { dbName } = req.user;
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const UsersSchema = createUsersModel(vendorDbConnection);

            let params = req.body;
            let subadmin = await UsersSchema.findOne(
                {
                    usertype: config.role.subadmin,
                    _id: params.userid
                },
                {
                    _id: 1,
                    id: "$_id",
                    phone: 1,
                    email: 1,
                    country_code: 1,
                    usertype: 1,
                    status: 1,
                    createdAt: 1,
                    subadminmodule_status: 1,
                    password: 1,
                    name: 1,
                    dob: 1,
                    gender: 1
                }
            ).lean();

            let data = {
                "userid": subadmin.id,
                "phone": subadmin.phone,
                "email": subadmin.email,
                "country_code": subadmin.country_code,
                "usertype": subadmin.usertype,
                "status": subadmin.status,
                "createdAt": subadmin.createdAt,
                "password": subadmin.password,
                "subadminmodule_status": JSON.parse(subadmin.subadminmodule_status),
                "name": subadmin.name || "",
                "dob": subadmin.dob || "",
                "gender": subadmin.gender || "",
            }

            return res.send(response(data, `Data view successfully.!`, true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack))
        }
    }
}
