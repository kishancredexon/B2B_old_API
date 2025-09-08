const express = require('express')
const router = express.Router()

const authorize = require("../../middleware/authorize_admin.middleware");
const transactionController = require('../controller/transactioncontroller');

module.exports = router

router.get('/list', authorize, transactionController.transaction_list); // Done
router.post('/filter', authorize, transactionController.transaction_filter); // Done
router.post('/download', authorize, transactionController.transaction_Sheet); // Done
router.get('/get-downloads', authorize, transactionController.getDownloadableFiles); // Done
router.get("/download-file/:fileId", authorize, transactionController.downloadFile); // Done
router.delete('/files', authorize, transactionController.deleteAllFiles);
