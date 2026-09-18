const { db } = require("../database/database");

const getUserId = require("./getUserid");

const addyourSkills = (req, res) => {

    // Get logged-in student's ID
    const studentId = getUserId();

    // Get new skill from request
    const newSkill = req.body.skills;

    if (!newSkill) {

        return res.status(400).json({
            error: "Skill is required"
        });

    }

    // Get current skills
    const sql = `
        SELECT skills
        FROM profile
        WHERE student_id = ?
    `;

    db.query(sql, [studentId], (err, data) => {

        // Database error
        if (err) {

            console.log(err);

            return res.status(500).json({
                error: "Error in database when getting skills"
            });

        }

        // Profile not found
        if (data.length === 0) {

            return res.status(404).json({
                error: "Profile not found"
            });

        }

        // ==============================
        // GET EXISTING SKILLS
        // ==============================

        let skills = [];

        try {

            const skillsData = data[0].skills;

            console.log("skillsData:", skillsData);
            console.log("Type:", typeof skillsData);

            // Empty value
            if (
                skillsData === null ||
                skillsData === undefined ||
                skillsData === ""
            ) {

                skills = [];

            }

            // JSON string
            else if (typeof skillsData === "string") {

                skills = JSON.parse(skillsData);

            }

            // Already an array
            else if (Array.isArray(skillsData)) {

                skills = skillsData;

            }

            // Invalid format
            else {

                return res.status(500).json({
                    error: "Invalid skills format"
                });

            }

        }

        catch (error) {

            console.log(
                "Invalid JSON in skills:",
                error
            );

            return res.status(500).json({
                error: "Skills data is invalid"
            });

        }

        // ==============================
        // MAKE SURE IT IS AN ARRAY
        // ==============================

        if (!Array.isArray(skills)) {

            return res.status(500).json({
                error: "Skills must be an array"
            });

        }

        // ==============================
        // CHECK DUPLICATE
        // ==============================

        if (!skills.includes(newSkill)) {

            skills.push(newSkill);

        }

        // ==============================
        // UPDATE DATABASE
        // ==============================

        const updatingSkills = `
            UPDATE profile
            SET skills = ?
            WHERE student_id = ?
        `;

        db.query(
            updatingSkills,
            [
                JSON.stringify(skills),
                studentId
            ],
            (error, result) => {

                // Database error
                if (error) {

                    console.log(error);

                    return res.status(500).json({
                        error: "Error in database when updating skills"
                    });

                }

                // Success
                return res.status(200).json({

                    message: "Skill added successfully",

                    skills: skills,

                    affectedRows: result.affectedRows

                });

            }
        );

    });

};

module.exports = {
    addyourSkills
};