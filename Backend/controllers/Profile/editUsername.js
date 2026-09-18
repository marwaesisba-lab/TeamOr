const { db } = require("../../database/database");
const getUserId = require("../../functions/getUserid");

const editUsername = (req, res) => {


const username = req.query.username;
const familynames = req.query.familynames;

const sql = `
    UPDATE Students
    SET username = ?, familynames = ?
    WHERE id = ?
`;

const id = getUserId();

console.log("ID used for update:", id);
console.log("New username:", username);
console.log("New family name:", familynames);

db.query(
    sql,
    [username, familynames, id],
    (err, infos) => {

        if (err) {

            console.log(
                "Database error when updating names:",
                err
            );

            return res.status(500).json({
                err: "Error in database when updating username and family name"
            });
        }


        console.log(
            "Names updated successfully:",
            infos
        );


        return res.status(200).json({

            success:
                "Username and family name updated successfully",

            username: username,

            familynames: familynames

        });

    }
);

};

module.exports = {
editUsername
};
