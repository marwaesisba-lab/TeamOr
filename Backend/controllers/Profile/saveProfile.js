const path = require("path");
const filesystem = require("fs");
const { db } = require("../../database/database");

const saveProfile = (req, res) => {

    filesystem.readFile(
        path.join(__dirname, "..", "infos.txt"),
        "utf8",
        (err, infoData) => {

            if (err) {
                console.log("Error when reading infos.txt:", err);

                return res.status(500).json({
                    error: "Error when reading user ID"
                });
            }

            // Get student ID
            const id = infoData.split(":")[1].trim();

            // --------------------------------
            // Get user information
            // --------------------------------

            const usernameSql = `
                SELECT username, familynames, section, groupe
                FROM Students
                WHERE id = ?
            `;

            db.query(
                usernameSql,
                [id],
                (err, userData) => {

                    if (err) {
                        console.log(err);

                        return res.status(500).json({
                            error: "Error in database when getting user information"
                        });
                    }

                    // User not found
                    if (userData.length === 0) {

                        return res.status(404).json({
                            error: "User not found"
                        });

                    }

                    const userInfo = {
                        username: userData[0].username,
                        familynames: userData[0].familynames,
                        section: userData[0].section,
                        groupe: userData[0].groupe
                    };

                    console.log("User information:", userInfo);

                    // --------------------------------
                    // Get image from uploadimages
                    // --------------------------------

                    const imageFolder = path.join(
                        __dirname,
                        "../../uploadimages"
                    );

                    filesystem.readdir(
                        imageFolder,
                        (error, files) => {

                            if (error) {
                                console.log(error);

                                return res.status(404).json({
                                    error: "Could not find uploadimages folder"
                                });
                            }

                            if (files.length === 0) {

                                return res.status(404).json({
                                    error: "No profile picture found"
                                });

                            }

                            // Get the first image
                            const profilePicture = files[0];

                            console.log(
                                "Profile picture:",
                                profilePicture
                            );

                            const imagePath = path.join(
                                imageFolder,
                                profilePicture
                            );

                            // --------------------------------
                            // Read image
                            // --------------------------------

                            filesystem.readFile(
                                imagePath,
                                (error, imageBuffer) => {

                                    if (error) {

                                        console.log(
                                            "Error when reading image:",
                                            error
                                        );

                                        return res.status(500).json({
                                            error: "Could not read profile picture"
                                        });

                                    }

                                    // --------------------------------
                                    // Check if profile exists
                                    // --------------------------------

                                    const checkSql = `
                                        SELECT id
                                        FROM profile
                                        WHERE student_id = ?
                                    `;

                                    db.query(
                                        checkSql,
                                        [id],
                                        (err, existingProfile) => {

                                            if (err) {

                                                console.log(err);

                                                return res.status(500).json({
                                                    error: "Error when checking profile"
                                                });

                                            }

                                            // --------------------------------
                                            // Profile exists
                                            // Update picture
                                            // --------------------------------

                                            if (existingProfile.length > 0) {

                                                const updateSql = `
                                                    UPDATE profile
                                                    SET picture_profile = ?
                                                    WHERE student_id = ?
                                                `;

                                                db.query(
                                                    updateSql,
                                                    [
                                                        imageBuffer,
                                                        id
                                                    ],
                                                    (err, result) => {

                                                        if (err) {

                                                            console.log(err);

                                                            return res.status(500).json({
                                                                error: err.message
                                                            });

                                                        }

                                                        return res.status(200).json({

                                                            message:
                                                                "Profile picture updated successfully",

                                                            user: userInfo,

                                                            profilePicture:
                                                                profilePicture

                                                        });

                                                    }
                                                );

                                                return;
                                            }

                                            // --------------------------------
                                            // Profile does not exist
                                            // Create profile
                                            // --------------------------------

                                            const insertSql = `
                                                INSERT INTO profile
                                                (
                                                    student_id,
                                                    \`desc\`,
                                                    skills,
                                                    picture_profile
                                                )
                                                VALUES (?, ?, ?, ?)
                                            `;

                                            db.query(
                                                insertSql,
                                                [
                                                    id,
                                                    "",
                                                    JSON.stringify([]),
                                                    imageBuffer
                                                ],
                                                (err, result) => {

                                                    if (err) {

                                                        console.log(err);

                                                        return res.status(500).json({
                                                            error: err.message
                                                        });

                                                    }

                                                    return res.status(200).json({

                                                        message:
                                                            "Profile saved successfully",

                                                        user: userInfo,

                                                        profilePicture:
                                                            profilePicture

                                                    });

                                                }
                                            );

                                        }
                                    );

                                }
                            );

                        }
                    );

                }
            );

        }
    );

};

module.exports = {
    saveProfile
};