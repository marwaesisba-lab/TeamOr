const request = require("supertest");
const { app } = require("../../server");

// testing saveProfile

describe("testing saveProfile POST /saveprofile", () => {

    // if saving profile successfully

    test("if saving all right", async () => {

        const response = await request(app)
            .post("/saveprofile");

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            message: "Profile picture updated successfully",

            user: {
                username: expect.any(String),
                familynames: expect.any(String),
                section: expect.any(String),
                groupe: expect.any(String)
            },

            profilePicture: expect.any(String)
        });
    });


    // if not saving correctly

    test("if does not work successfully", async () => {

        const anotherresponse = await request(app)
            .post("/saveprofile");

        expect(anotherresponse.status).toBe(404);
    });

});

// __________________ testing editUsenname_____________________

describe("if update user info correctly PUT /updatingnames", () => {

    test("the updating correct", async () => {
        const response = await request(app)
    .put("/updatingnames")
    .query({
        username: "Hicham",
        familynames: "cook"
    });

console.log("STATUS:", response.status);
console.log("BODY:", response.body);
console.log("TEXT:", response.text);

expect(response.status).toBe(200);

        }        );

});
// ______________________ testing add description _________________________

describe("add description POST /add-desc", () => {

    test("if posted the description successfully", async () => {

        const response = await request(app)
            .post("/add-desc")
            .send({
                desc: "This is my new description"
            });

        expect(response.status).toBe(200);

        expect(response.headers["content-type"]).toMatch(/json/);

        expect(response.body).toEqual(
            expect.objectContaining({
                message: "Description updated successfully",
                affectedRows: expect.any(Number),
                desc: expect.any(String)
            })
        );

    });

});