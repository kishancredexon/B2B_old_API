const { connectWithVendorDb } = require("../../config/mongodb_connections");
const response = require("../../helper/response");
const excel = require("exceljs");
const createTransactionsModel = require("../../mongo_models_new/credexon_vendor/TransactionsSchema");
const createTransactionsFilesModel = require("../../mongo_models_new/credexon_vendor/TransactionsFilesSchema");
const fs = require("fs");
const path = require("path");

module.exports = {
  transaction_list: async (req, res) => {
    try {
      const { dbName } = req.user;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const TransactionsSchema = createTransactionsModel(vendorDbConnection);

      const page = parseInt(req.query.page || 1);
      const size = parseInt(req.query.size || 25);

      const transactionList = await TransactionsSchema.aggregate([
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * size },
        { $limit: size },
        {
          $lookup: {
            from: "users",
            localField: "userid",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $lookup: {
            from: "transactions_doc",
            localField: "_id",
            foreignField: "trans_id",
            as: "transactions_doc",
          },
        },
        {
          $addFields: {
            user: { $arrayElemAt: ["$user", 0] },
            transactions_doc: { $arrayElemAt: ["$transactions_doc", 0] },
          },
        },
        {
          $project: {
            id: "$_id",
            amount: 1,
            txid: 1,
            status: 1,
            txdate: 1,
            ttype: 1,
            atype: 1,
            wit: 1,
            createdAt: 1,
            "user.id": "$user._id",
            "user.email": 1,
            "user.phone": 1,
            "user.country_code": 1,
            "transactions_doc.id": "$transactions_doc._id",
            "transactions_doc.trans_id": 1,
            "transactions_doc.payment_id": 1,
            "transactions_doc.amount": 1,
            "transactions_doc.currency": 1,
            "transactions_doc.order_id": 1,
            "transactions_doc.method": 1,
            "transactions_doc.vpa": 1,
            "transactions_doc.transaction_id": 1,
          },
        },
      ]);

      const totalCount = await TransactionsSchema.estimatedDocumentCount();

      return res.send(
        response(
          {
            total_count: totalCount,
            transaction_list: transactionList,
          },
          "Data found successfully!",
          true
        )
      );
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong!", false, null, error.stack));
    }
  },
  transaction_filter: async (req, res) => {
    try {
      const { dbName } = req.user;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const TransactionsSchema = createTransactionsModel(vendorDbConnection);

      const page = parseInt(req.query.page || 1);
      const size = parseInt(req.query.size || 25);
      const params = req.body;

      let transactionFilter = {};
      let userFilter = {};

      if (params?.typ && params.typ !== "" && params.typ > "0") {
        transactionFilter["trans_status"] = params.typ;
      }
      if (params?.email) {
        userFilter["email"] = params.email;
      }
      if (params?.phone) {
        userFilter["phone"] = params.phone;
      }

      const pipeline = [
        { $match: transactionFilter },
        {
          $lookup: {
            from: "users",
            localField: "userid",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $lookup: {
            from: "transactions_doc",
            localField: "_id",
            foreignField: "trans_id",
            as: "transactions_doc",
          },
        },
        {
          $addFields: {
            user: { $arrayElemAt: ["$user", 0] },
            transactions_doc: { $arrayElemAt: ["$transactions_doc", 0] },
          },
        },
        {
          $project: {
            id: "$_id",
            userid: 1,
            amount: 1,
            txid: 1,
            status: 1,
            txdate: 1,
            docid: 1,
            ttype: 1,
            atype: 1,
            wit: 1,
            prebal: 1,
            curbal: 1,
            jpoolid: 1,
            trans_status: 1,
            createdAt: 1,
            "user.id": "$user._id",
            "user.email": 1,
            "user.phone": 1,
            "user.country_code": 1,
            "transactions_doc.id": "$transactions_doc._id",
            "transactions_doc.trans_id": 1,
            "transactions_doc.payment_id": 1,
            "transactions_doc.amount": 1,
            "transactions_doc.currency": 1,
            "transactions_doc.order_id": 1,
            "transactions_doc.method": 1,
            "transactions_doc.vpa": 1,
            "transactions_doc.transaction_id": 1,
          },
        },
        {
          $match: {
            ...(userFilter.email ? { "user.email": userFilter.email } : {}),
            ...(userFilter.phone ? { "user.phone": userFilter.phone } : {}),
          },
        },
        {
          $facet: {
            metadata: [{ $count: "total_count" }],
            data: [{ $sort: { createdAt: -1 } }, { $skip: (page - 1) * size }, { $limit: size }],
          },
        },
      ];

      const result = await TransactionsSchema.aggregate(pipeline);

      const totalCount = result[0].metadata.length > 0 ? result[0].metadata[0].total_count : 0;
      const transactionList = result[0].data;

      return res.send(
        response(
          {
            total_count: totalCount,
            transaction_list: transactionList,
          },
          "Data found successfully!",
          true
        )
      );
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.", false, null, error.stack));
    }
  },
  transaction_Sheet: async (req, res) => {
    try {
      const { dbName } = req.user;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const Transactions = createTransactionsModel(vendorDbConnection);

      const params = req.body;

      let transactionFilter = {};
      if (params?.typ && params.typ !== "" && params.typ > "0") {
        transactionFilter["trans_status"] = params.typ;
      }

      // Send immediate response
      res.send(response([], "Your file is being generating. Please check the available downloads later.", true));

      // Process transactions in the background
      const cursor = await Transactions.aggregate([
        {
          $match: transactionFilter,
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $lookup: {
            from: "users",
            localField: "userid",
            foreignField: "_id",
            as: "user",
          },
        },

        {
          $lookup: {
            from: "transactions_doc",
            localField: "_id",
            foreignField: "trans_id",
            as: "transactions_doc",
          },
        },
        {
          $addFields: {
            user: { $arrayElemAt: ["$user", 0] },
            transactions_doc: { $arrayElemAt: ["$transactions_doc", 0] },
          },
        },
        {
          $match: {
            ...(params.email ? { "user.email": params.email } : {}),
            ...(params.phone ? { "user.phone": params.phone } : {}),
          },
        },
        {
          $project: {
            amount: 1,
            txid: 1,
            status: 1,
            txdate: 1,
            docid: 1,
            ttype: 1,
            atype: 1,
            wit: 1,
            prebal: 1,
            curbal: 1,
            jpoolid: 1,
            createdAt: 1,
            "user.email": 1,
            "user.phone": 1,
            "user.country_code": 1,
            "transactions_doc.payment_id": 1,
            "transactions_doc.currency": 1,
            "transactions_doc.order_id": 1,
            "transactions_doc.method": 1,
            "transactions_doc.vpa": 1,
            "transactions_doc.transaction_id": 1,
          },
        },
      ])
        .cursor({ batchSize: 50000 })
        .exec();

      // Create Excel File
      let workbook = new excel.Workbook();
      let worksheet = workbook.addWorksheet("User");

      worksheet.columns = [
        { header: "Order_id", key: "order_id", width: 50 },
        { header: "Transaction_id", key: "txid", width: 25 },
        { header: "Transaction_type", key: "ttype", width: 18 },
        { header: "Client_email", key: "client_email", width: 35 },
        { header: "Phone", key: "phone", width: 35 },
        { header: "Method", key: "method", width: 25 },
        { header: "Status", key: "status", width: 18 },
        { header: "Previous_Balance", key: "prebal", width: 18 },
        { header: "Current_Balance", key: "curbal", width: 18 },
        { header: "Amount", key: "amount", width: 18 },
        { header: "Created_Date", key: "createdAt", width: 30 },
      ];

      for await (const item of cursor) {
        const row = {
          amount: item.amount,
          txid: item.txid,
          status: item.status,
          ttype: item.ttype,
          atype: item.atype,
          wit: item.wit,
          prebal: item.prebal,
          curbal: item.curbal,
          client_email: item.user?.email,
          phone: item.user?.phone,
          country_code: item.user?.country_code,
          payement_id: item.transactions_doc?.payment_id,
          currency: item.transactions_doc?.currency,
          order_id: item.transactions_doc?.order_id,
          method: item.transactions_doc?.method,
          vpa: item.transactions_doc?.vpa,
          transaction_id: item.transactions_doc?.transaction_id,
          createdAt: item.createdAt,
        };
        worksheet.addRow(row);
      }

      // Save Excel File Locally
      const fileName = `transactions_${Date.now()}.xlsx`;
      const dirPath = path.join(__dirname, "..", "..", "upload", `${req.user._id}`, "transactions-downloads");
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true }); // Create directory if it doesn't exist
      }
      const filePath = path.join(dirPath, fileName);
      await workbook.xlsx.writeFile(filePath);

      const TransactionFile = createTransactionsFilesModel(vendorDbConnection);

      // Store File Metadata in MongoDB
      await TransactionFile.create({
        userId: req.user._id,
        filePath: filePath,
        fileName: fileName,
        fileSize: fs.statSync(filePath).size,
        format: "xlsx",
        status: "completed",
      });
    } catch (error) {
      console.error("Error generating file:", error);
    }
  },
  getDownloadableFiles: async (req, res) => {
    try {
      const { dbName } = req.user;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const TransactionFile = createTransactionsFilesModel(vendorDbConnection);
      const files = await TransactionFile.find({ userId: req.user._id }).sort({ createdAt: -1 });
      res.send(response(files, "Success.", true));
    } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching files" });
    }
  },
  downloadFile: async (req, res) => {
    try {
      const { dbName } = req.user;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const TransactionFile = createTransactionsFilesModel(vendorDbConnection);
      const file = await TransactionFile.findOne({ _id: req.params.fileId, userId: req.user._id });
      if (!file) {
        return res.send(response([], "File not found", false));
      }

      res.download(file.filePath, file.fileName);
    } catch (error) {
      return res.send(response([], "Error downloading file", false));
    }
  },
  deleteAllFiles: async (req, res) => {
    try {
      const userId = req.user._id;
      const { dbName } = req.user;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const TransactionFile = createTransactionsFilesModel(vendorDbConnection);

      const userFiles = await TransactionFile.find({ userId });

      userFiles.forEach((file) => {
        const filePath = file?.filePath;
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Remove file from the server
          }
        } catch (err) {}
      });

      await TransactionFile.deleteMany({ userId });

      // Delete files which may still left in directory but deleted from
      try {
        const dirPath = path.join(__dirname, "..", "..", "upload", `${userId}`, "transactions-downloads");
        if (fs.existsSync(dirPath)) fs.rmSync(dirPath, { recursive: true, force: true });
      } catch (err) {}

      return res.send(response([], "All transaction files deleted successfully.", true));
    } catch (error) {
      console.error("Delete error:", error);
      return res.send(response([], "Internal server error", false));
    }
  },
};
