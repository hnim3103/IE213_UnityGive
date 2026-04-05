import request from "supertest";
import app from "../src/server.js";
import User from "../src/models/User.js";

describe("Donations API Endpoints", () => {
    let token;
    let testUser;

    beforeEach(async () => {
        await request(app).post("/api/auth/signup").send({
            name: "Donor",
            email: "donor@example.com",
            password: "Password123",
        });

        const res = await request(app).post("/api/auth/login").send({
            email: "donor@example.com",
            password: "Password123",
        });
        token = res.body.token;
        testUser = await User.findOne({ email: "donor@example.com" });
    });

    it("should get all donations with admin token", async () => {
        // Make user an admin
        testUser.role = "admin";
        await testUser.save();

        // Re-login to get admin token
        const adminRes = await request(app).post("/api/auth/login").send({
            email: "donor@example.com",
            password: "Password123",
        });
        const adminToken = adminRes.body.token;

        const response = await request(app)
            .get("/api/donations")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("should block non-admins from getting all donations", async () => {
        // Normal donor token (not admin)
        const response = await request(app)
            .get("/api/donations")
            .set("Authorization", `Bearer ${token}`);

        // Expected to be 403 Forbidden or 401 Unauthorized based on middleware
        expect(response.status).toBeGreaterThanOrEqual(401);
    });

    it("should create a new donation successfully", async () => {
        const response = await request(app)
            .post("/api/donations")
            .set("Authorization", `Bearer ${token}`)
            .send({
                campaignId: "664f1b2c9a1e2d3f4a5b6c7e",
                donorId: testUser._id,
                amount: "500000000000000000",
                method: "crypto"
            });

        expect(response.status).toBe(201);
        expect(response.body.amount).toBe("500000000000000000");
    });
});
