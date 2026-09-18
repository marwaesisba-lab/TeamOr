const path = require("path");
const filesystem = require("fs");
const { db } = require("../../database/database");

const saveProfile = (req, res) => {


filesystem.readFile(
    path.join(__dirname, "..", "infos.txt"),
    "utf8",
    (err, data) => {

        if (err) {
            console.log("Error when reading file:", err);

            return res.status(500).json({
                error: "Error when reading user ID"
            });
        }

        // Get ID from infos.txt
        const id = data.split(":")[1].trim();

        // --------------------------------
        // Get username, family name,
        // section and groupe FIRST
        // --------------------------------

        const usernameSql = `
            SELECT username, familynames, section, groupe
            FROM Students
            WHERE id = ?
        `;

        db.query(
            usernameSql,
            [id],
            (err, data) => {

                if (err) {
                    return res.status(500).json({
                        error:
                            "Error in database when getting the user information"
                    });
                }

                // User not found
                if (data.length === 0) {
                    return res.status(404).json({
                        usernotfound: "User not found"
                    });
                }

                // --------------------------------
                // User information
                // --------------------------------

                const userInfo = {
                    username: data[0].username,
                    familynames: data[0].familynames,
                    section: data[0].section,
                    groupe: data[0].groupe
                };

                console.log("User information:", userInfo);

                // --------------------------------
                // Get the profile picture
                // --------------------------------

                const imageFolder = path.join(
                    __dirname,
                    "../../uploadimages"
                );

                filesystem.readdir(
                    imageFolder,
                    (error, files) => {

                        if (error) {
                            return res.status(404).json({
                                err: "Could not find the folder"
                            });
                        }

                        if (files.length === 0) {
                            return res.status(404).json({
                                err: "No profile picture found"
                            });
                        }

                        // Get the first image
                        const profilePicture = files[0];

                        console.log(
                            "Profile picture:",
                            profilePicture
                        );

                        // Full path of the image
                        const imagePath = path.join(
                            imageFolder,
                            profilePicture
                        );

                        // --------------------------------
                        // Read the complete image
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
                                        error:
                                            "Could not read the profile picture"
                                    });
                                }

                                // --------------------------------
                                // Check if profile already exists
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
                                            return res.status(500).json({
                                                error:
                                                    "Error when checking profile"
                                            });
                                        }

                                        // --------------------------------
                                        // Profile already exists
                                        // Update old picture
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
                                                        return res.status(500).json({
                                                            error:
                                                                err.message
                                                        });
                                                    }

                                                    console.log(
                                                        "Old profile picture replaced successfully"
                                                    );

                                                    return res.status(200).json({
                                                        message:
                                                            "Profile picture updated successfully",

                                                        user:
                                                            userInfo,

                                                        profilePicture:
                                                            profilePicture
                                                    });
                                                }
                                            );

                                            return;
                                        }

                                        // --------------------------------
                                        // Profile does not exist
                                        // Create new profile
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
                                                    return res.status(500).json({
                                                        error:
                                                            err.message
                                                    });
                                                }

                                                console.log(
                                                    "Profile and picture inserted successfully"
                                                );

                                                return res.status(200).json({
                                                    message:
                                                        "Profile saved successfully",

                                                    user:
                                                        userInfo,

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
