const path = require('path')
const checkfileinfos =(file, callback) => {
    // check file type 

    const filetype = /jpeg|png|gif|jpg/

    // chech extenstion of file 
    const extention = filetype.test(path.extname(file.originalname).toLocaleLowerCase())  ; 

    // ckech mimetype like : application / json 
     const mimetype  = filetype.test(file.mimetype) ;
    
     // test the extesion name and mimetype are true (we verify the mimetype important because the extesion it's not enougth )

     if(mimetype && extention) {
        return callback(null , true)
     }
     else {
        return callback("Error Only imagrs try again " )
     }
      // the extension important to verify  if this uploadings are images 
      // us we can see in portswigger we must verify the content type of  files uploading 
}

module.exports = {
    checkfileinfos
}