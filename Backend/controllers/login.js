
const { db } = require("../database/database");

const { validationResult } = require("express-validator");

const jwt = require("jsonwebtoken");
const { getId } = require("../functions/getUserid");
const path = require('path')
const fs = require('fs')

const loginUsers = (req, res) => {

    const { email, password } = req.body;

    const results = validationResult(req);

    console.log("Result from express-validator:", results.array());

    console.log("Login request:", email);

    if (!results.isEmpty()) {

        return res.status(400).json({

            success: false,

            errors: results.array()

        });

    }

    const sql = `
        SELECT id, email, password, role
        FROM Students
        WHERE email = ? AND password = ?
    `;

    db.query(sql, [email, password], (error, data) => {

        if (error) {

            console.error("Database error:", error);

            return res.status(500).json({

                success: false,

                message: "Error in fetching database"

            });

        }

        console.log("Query result:", data);

        if (data.length === 0) {

            return res.status(401).json({

                success: false,

                message: "User does not exist or password is incorrect"

            });

        }

        const user = data[0];

        const id = user.id;
        
        // register in info 
        fs.writeFile(
    path.join(__dirname, 'infos.txt'),
    `userId:${id}`,
    (err) => {

        if (err) {
            console.log('error in fs:', err);
        } else {
            console.log('fs write successfully');
        }

    }
);
      
        

        // -------------- userToken {json javascript web token } ----------

        console.log("BEFORE ACCESS TOKEN");


        const refreshToken = jwt.sign({

            userrole: user.role,

            id: user.id,

        },

        process.env.refresh_Token,

        {

            expiresIn: "1d",

        }

        );

        console.log("REFRESH TOKEN CREATED");

        if (refreshToken) {

            const insertrefreshToken = `
                UPDATE Students
                SET refreshToken = ?
                WHERE id = ?
            `;

            console.log("BEFORE UPDATE");

            db.query(
                insertrefreshToken,
                [refreshToken, id],
                (error, data) => {

                    console.log("INSIDE UPDATE CALLBACK");

                    if (error) {

                        console.log("UPDATE ERROR:", error);

                        return res.status(500).json({

                            error: `error in data base when updating refresh token`

                        });

                    }

                    console.log("refresh token add successful");

                    console.log("UPDATE DATA:", data);

                    if (user.role === "student") {

                        return res.json({

                            success: true,

                            message: "Login successful",

                            redirect: "/html/page1.html",

                            user: {

                                id: user.id,

                                email: user.email,

                                role: user.role

                            }

                        });

                    } 
                    // ***************** send it to cookie  **************

                    // *************** refresh Token *********************
                    
                    res.cookie('jwtrefreshToken' , refreshToken , {
                        httpOnly:true ,
                        secure:true ,
                       sameSite: "strict"
                    }) ; 
                     
                     // ************ access Token in cookie  *************
                     const accessToken = jwt.sign({
            
                        userrole: user.role,
            
                        id: user.id,
            
                    },
            
                    process.env.Access_Token,
            
                    {
            
                        expiresIn: "60s",
            
                    }
                  
            
                    );
                    res.cookie('jwtaccessToken' , accessToken , {
                        httpOnly:true ,
                        secure:false,
                       sameSite: "strict"
                    }) ; 
                        

                    if (user.role === "admin") {

                        return res.json({

                            success: true,

                            message: "Login successful",

                            redirect: "/admin/admin.html",

                            user: {

                                id: user.id,

                                email: user.email,

                                role: user.role

                            }

                        });

                    }

                }
            );

        }

    });

};

module.exports = {

    loginUsers

};

