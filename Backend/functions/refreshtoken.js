
const { db } = require("../database/database");
const jwt = require("jsonwebtoken");

const newAccessToken = (req, res) => {

    // Get refresh token from cookie
    const refreshToken = req.cookies?.jwtrefreshToken;

    // No refresh token
    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            message: "Refresh token is missing"
        });
    }

    // Find the user by the refresh token
    const sql = `
        SELECT id, role, refreshToken
        FROM Students
        WHERE refreshToken = ?
    `;

    db.query(sql, [refreshToken], (err, data) => {

        // Database error
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database error while creating new access token"
            });
        }

        // Refresh token does not belong to any user
        if (data.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Invalid refresh token"
            });
        }

        const user = data[0];

        // Verify refresh token
        jwt.verify(
            refreshToken,
            process.env.refresh_Token,
            (err, decoded) => {

                // Invalid or expired refresh token
                if (err) {
                    return res.status(403).json({
                        success: false,
                        message: "Refresh token is invalid or expired"
                    });
                }

                // Optional but recommended:
                // Make sure the token belongs to the same user
                if (decoded.id !== user.id) {
                    return res.status(403).json({
                        success: false,
                        message: "Refresh token does not belong to this user"
                    });
                }

                // Create a new access token
                const newAccessToken = jwt.sign(
                    {
                        id: user.id,
                        role: user.role
                    },
                    process.env.Access_Token,
                    {
                        expiresIn: "60s"
                    }
                );

                // Send new access token as a cookie
                res.cookie("jwtaccessToken", newAccessToken, {
                    httpOnly: true,
                    secure: false, // true in production with HTTPS
                    sameSite: "strict"
                });

                return res.status(200).json({
                    success: true,
                    message: "New access token created"
                });
            }
        );
    });
};

module.exports = {
    newAccessToken
};

