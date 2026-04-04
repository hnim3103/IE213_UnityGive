import request from "supertest";
import app from "../src/server.js";
import User from "../src/models/User.js";

describe("Organizations API Endpoints", () => {
    let token;
    let testUser;

    beforeEach(async () => {
        await request(app).post("/api/auth/signup").send({
            name: "Org Admin",
            email: "admin@org.com",
            password: "Password123",
        });

        const res = await request(app).post("/api/auth/login").send({
            email: "admin@org.com",
            password: "Password123",
        });
        token = res.body.token;
        testUser = await User.findOne({ email: "admin@org.com" });
    });

    it("should get all organizations", async () => {
        const response = await request(app).get("/api/organizations");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("should create a new organization with auth token", async () => {
        const response = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "New Web3 Charity",
                description: "Helping build web3 infrastructures.",
                adminUserId: testUser._id,
                orgWalletAddress: "0x456"
            });

        expect(response.status).toBe(201);
        expect(response.body.name).toBe("New Web3 Charity");
    });
});
