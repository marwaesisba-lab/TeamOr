const { db } = require("../../database/database");
const getUserId = require("../../functions/getUserid");

const addDescription = (req, res) => {

    const id = getUserId();

    console.log("========== ADD DESCRIPTION ==========");
    console.log("USER ID:", id);
    console.log("USER ID TYPE:", typeof id);
    console.log("BODY:", req.body);
    console.log("=====================================");


    if (!id) {
        return res.status(401).json({
            error: "User ID not found"
        });
    }


    const desc = req.body.desc;


    if (!desc || desc.trim() === "") {
        return res.status(400).json({
            error: "Description cannot be empty"
        });
    }


    const sql = `
        UPDATE profile
        SET \`desc\` = ?
        WHERE student_id = ?
    `;


    db.query(
        sql,
        [
            desc.trim(),
            id
        ],
        (err, data) => {

            if (err) {

                console.log("DATABASE ERROR:", err);

                return res.status(500).json({
                    error: err.message
                });
            }


            console.log("MYSQL RESULT:", data);


            return res.status(200).json({

                message: "Description updated successfully",

                affectedRows: data.affectedRows,

                desc: desc.trim()

            });

        }
    );

};


module.exports = {
    addDescription
};