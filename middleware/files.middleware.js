const { _uploadPath } = require('../Constant');
const mv = require('mv');

async function singleFileRequest(files_detail) {
  return new Promise((resolve, reject) => {
    let files = files_detail.files;
    if (Object.keys(files).length > 0) {
      let openedFiles = files_detail.img_name;

      let oldpath;
      let newpath;
      if (openedFiles.mimetype == 'image/jpeg' || openedFiles.mimetype == 'image/png' || openedFiles.mimetype == 'image/jpg' || openedFiles.mimetype == 'application/pdf') {
        var file_name = '';
        if (openedFiles.mimetype == 'application/pdf') {
          file_name = 'PDF_Data_' + Date.now() + '.pdf';
        } else if (openedFiles.mimetype == 'image/png') {
          file_name = 'profile' + Date.now() + '.png';
        } else {
          file_name = 'profile' + Date.now() + '.jpg';
        }
        //form_datas.comp_incop_certif_url = file_name;
        oldpath = openedFiles.filepath;
        newpath = _uploadPath() + files_detail.folder_name + '/' + file_name

        mv(oldpath, newpath, function (err) {
          resolve(file_name);
          //if (err) throw err;
        });


      } else {
        //throw "Doc Format is not correct";
      }
    }
  })
}

module.exports = singleFileRequest
