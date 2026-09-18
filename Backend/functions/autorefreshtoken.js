
const jwt = require("jsonwebtoken");
const { newAccessToken } = require("./refreshtoken");

const autoRefreshToken = (req, res, next) => {

    const accessToken = req.cookies?.jwtaccessToken;

    // No access token
    if (!accessToken) {
        return newAccessToken(req, res, next);
    }

    jwt.verify(
        accessToken,
        process.env.Access_Token,
        (err, decoded) => {

            // Access token is valid
            if (!err) {

                req.userselcted = {
                    id: decoded.id,
                    role: decoded.role
                };

                return next();
            }

            // Access token expired
            if (err.name === "TokenExpiredError") {
                return newAccessToken(req, res, next);
            }

            // Invalid access token
            return res.status(403).json({
                success: false,
                message: "Invalid access token"
            });
        }
    );
};

module.exports = {
    autoRefreshToken
};

