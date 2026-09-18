const path = require("path");
const fs = require("fs");

const getUserId = () => {
    const data = fs.readFileSync(
        path.join(__dirname,"..", "controllers", "infos.txt"),
        "utf8"
    );

    const id = data.split(":")[1].trim();

    return id;
};

module.exports = getUserId;