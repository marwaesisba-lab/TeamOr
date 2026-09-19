const express = require("express") ;
const { loginUsers } = require("../controllers/login");
const routers = express.Router() ; 
const  multer = require('multer') ;
const path = require("path") ;


const {body , validationResult ,param} = require("express-validator")
const limiter = require('express-rate-limit');
const { verifyToken } = require("../functions/verifyToken");
const { newAccessToken } = require("../functions/refreshtoken");
const { autoRefreshToken } = require("../functions/autorefreshtoken");
const { checkfileinfos } = require("../frontend/checkfileinfos");
const fs = require('fs');
const { saveProfile } = require("../controllers/Profile/saveProfile");
const { editUsername } = require("../controllers/Profile/editUsername");
const { addDescription } = require("../controllers/Profile/adddescription");
const getUserId = require("../functions/getUserid");
const { addyourSkills } = require("../functions/addYourSkills");
const { saveUpdates } = require("../functions/saveallupdates");
const { db } = require("../database/database");

const loginLimiter = limiter.rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Try again after 15 minutes."
    }
});
routers.get("/profile" , verifyToken , (err , res  ) => {
    console.log("sucess")
})
routers.get("/" , verifyToken)

routers.post("/login" , [
    body('email').notEmpty().isString().withMessage('email must be string ').isEmail()  ,
    body('password').notEmpty().withMessage('password must not be empty').isLength({min:6 , max:12}).withMessage('password length must be between 6 - 12 charackters ')

] , 
loginLimiter , // for limiting brute force 

loginUsers) ;
// get profile
// refresh new token 
routers.post("/refresh" , newAccessToken) ; 
const storage = multer.diskStorage({

    destination: function (req, file, callback) {

        // for deleting old pictures
        const folder = './uploadimages';

        fs.readdir(folder, (err, files) => {

            if (err) {
                return callback(err);
            }

            files.forEach((file) => {

                fs.unlink(path.join(folder, file), (err) => {

                    if (err) {
                        console.log("Error deleting:", err);
                    }

                });

            });

            callback(null, folder);

        });

    },

    filename: function (req, file, callback) {

        callback(
            null,
            file.fieldname + '~' + Date.now() + path.extname(file.originalname)
        );

    }

});
const upload = multer({
    storage:storage , 
    limits:{
        fileSize:1000 * 1024 * 1024
    } , 
    
    fileFilter : function (req , file , callback) {
        checkfileinfos(file, callback)


     }
}).single("imagesuploads")
 

// get  user id 
routers.get("/getId", (req, res) => {

    const id = getUserId();

    res.json({
        id: id
    });

});
// just for testing 

routers.get("/test-route", (req, res) => {
    res.send("ROUTER IS WORKING");
});
routers.get("/profile/:id",

    param('id')
        .notEmpty()
        .withMessage("id is required")
        .isUUID()
        .withMessage("id must be a valid UUID"),

    autoRefreshToken,
    verifyToken,

    (req, res) => {

        const result = validationResult(req);

        if (!result.isEmpty()) {
            return res.status(400).json({
                errors: result.array()
            });
        }

        if (req.userselcted.id !== req.params.id) {
            return res.status(401).json({
                message: "unauth user in router get"
            });
        }

         res.render("profile", {
            userId: req.userselcted.id,
            role: req.userselcted.role
        });  
    }
);
routers.post('/addskills' , addyourSkills)

// get all data
routers.get("/profile-data/:id",
    param('id')
        .notEmpty()
        .withMessage("id is required")
        .isUUID()
        .withMessage("id must be a valid UUID"),

    autoRefreshToken,
    verifyToken,

    (req, res) => {

        const result = validationResult(req);

        if (!result.isEmpty()) {
            return res.status(400).json({
                errors: result.array()
            });
        }

        if (req.userselcted.id !== req.params.id) {
            return res.status(401).json({
                message: "unauth user in router get"
            });
        }
        saveUpdates(req, res )

    }
);


// ___________________ add user skills ______________________



routers.post("/saveprofile", (req, res) => {

    upload(req, res, (error) => {

        if (error) {
            console.log("Multer error:", error);

            return res.status(500).json({
                error: error.message
            });
        }

        if (!req.file) {
            return res.status(400).json({
                error: "You did not select any file"
            });
        }

        console.log("File uploading information:", req.file);

        saveProfile(req, res);
    });

});
routers.put("/updatingnames" , editUsername)
routers.post("/add-desc" , addDescription)
// save all informations for reload pages 
//  ******************* (when reload  profile page getting all informations ) *********8
routers.get("/getallinfos" , saveUpdates)
module.exports = { routers}