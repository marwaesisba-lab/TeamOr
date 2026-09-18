require("dotenv").config({
    path: "../../.env"
});
const request = require("supertest");
const jwt = require("jsonwebtoken");

const { app } = require("../../server");

const userId = "8cda9b13-a3b3-11f1-86ce-ae0e399c6f6d";

const accessToken = jwt.sign(
    {
        id: userId,
        role: "student"
    },
    process.env.Access_Token,
    {
        expiresIn: "60s"
    }
);
console.log(`access token is  : ` , accessToken)

describe("GET /profile/:${userId}", () => {

    describe("User has a valid access token", () => {

        test("should return 200", async () => {

            const response = await request(app)
                .get(`/profile/${userId}`)
                .set(
                    "Cookie",
                    `jwtaccessToken=${accessToken}`
                );

            expect(response.status).toBe(200);

        });
        // if  there is  no access token 
        describe("if does not have access token for user " , ()=> {
            test("test if there is no acces token " , async()=> {
                const response = request(app).get("/profile/:id")
                
                expect((await response).status).toBe(401) ;
                console.log("error user  does not have acess token ")
            })
        })
    

    });

});

console.log("testing /login api ") ;
// testing log in :

describe("POST /login", () => {

    // 1. Email + password both corrects 
    test("should login successfully", async () => {

        const response = await request(app)
            .post("/login")
            .send({
                email: "ma.yahiaoui@esi-sba.dz",
                password: "password123"
            });

        console.log(response.status);
        console.log(response.body);

        expect(response.status).toBe(200);
    });


    // 2. Email + password both incorrects
    test("should reject invalid credentials", async () => {

        const response = await request(app)
            .post("/login")
            .send({
                email: "ma.yahiaoui@esi-sba.dz'or 1=1 --",
                password: "wronfr"
            });

        console.log(response.status);
        console.log(response.body);

        expect(response.status).toBe(401);
    });

});

