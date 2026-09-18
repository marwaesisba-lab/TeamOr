
const { db } = require("../database/database");

const handleLogout = (req, res) => {

    // The user ID should come from the verified JWT,
    // NOT from req.query.id
    const id = req.user.id;

    const sql = `
        UPDATE Students
        SET refreshToken = NULL
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.error("Logout database error:", err);

            return res.status(500).json({
                success: false,
                error: "Error when logging out"
            });
        }

        // User does not exist
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Clear access token cookie
        res.clearCookie("jwtaccessToken", {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        });

        // Clear refresh token cookie
        res.clearCookie("jwtrefreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        });

        console.log(`User ${id} logged out successfully`);

        return res.status(200).json({
            success: true,
            message: "Logout successful"
        });
    });
};

module.exports = {
    handleLogout
};

