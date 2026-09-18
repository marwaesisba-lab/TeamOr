
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {

    const token = req.cookies.jwtaccessToken;

    if (!token) {

        return res.status(403).json({

            unauth: `user unauthorized`

        });

    }

    jwt.verify(

        token,

        process.env.Access_Token,

        (err, decoded) => {

            if (err) {

                // invalid Token

                return res.status(403).json({

                    unauth: `invalid token try again`

                });

            }

            // else valid token

                    


            const userauth = req.userselcted = {

                id: decoded.id,

                role: decoded.userrole

            };

            console.log(userauth);

            next();

        }

    );

};

module.exports = {

    verifyToken

};

