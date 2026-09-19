const { db } = require("../database/database");
const getUserId = require("./getUserid");

const saveUpdates = (req, res) => {

    const id = getUserId();

    const sql = `
        SELECT
            s.username,
            s.familynames,
            s.section,
            s.groupe,
            p.desc,
            p.skills,
            p.picture_profile
        FROM Students AS s
        LEFT JOIN profile AS p
            ON s.id = p.student_id
        WHERE s.id = ?
    `;

    db.query(sql, [id], (error, data) => {

        // Database error
        if (error) {
            console.log("Error getting profile:", error);

            return res.status(500).json({
                error: "Error in database when trying to get user information"
            });
        }

        // User doesn't exist
        if (data.length === 0) {
            return res.status(404).json({
                error: "User does not exist"
            });
        }

        const user = data[0];

        // ==========================================
        // SKILLS
        // ==========================================

        let skills = [];

        if (user.skills) {

            try {

                // Convert Buffer -> String
                const skillsString = user.skills.toString();

                // mysql,java,nodejs
                skills = skillsString
                    .split(",")
                    .map(skill => skill.trim())
                    .filter(skill => skill !== "");

            } catch (error) {

                console.log("Error when reading skills:", error);

                skills = [];
            }
        }

        // ==========================================
        // PROFILE PICTURE
        // ==========================================

        let picture = null;

        if (user.picture_profile) {

            picture =
                `data:image/jpeg;base64,${user.picture_profile.toString("base64")}`;
        }

        // ==========================================
        // SEND DATA TO FRONTEND
        // ==========================================

        return res.status(200).json({

            username: user.username,

            familynames: user.familynames,

            section: user.section,

            groupe: user.groupe,

            skills: skills,

            desc: user.desc || "",

            picture: picture
        });
    });
};

module.exports = {
    saveUpdates
};