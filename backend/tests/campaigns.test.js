import request from "supertest";
import app from "../src/server.js";
import User from "../src/models/User.js";
import Organization from "../src/models/Organization.js";

describe("Campaign API Endpoints", () => {
    let token;
    let testUser;
    let testOrganization;

    beforeEach(async () => {
        await request(app).post("/api/auth/signup").send({
            name: "Campaign Creator",
            email: "creator@example.com",
            password: "Password123",
        });

        const res = await request(app).post("/api/auth/login").send({
            email: "creator@example.com",
            password: "Password123",
        });
        token = res.body.token;

        // Fetch directly from DB to secure the valid MongoDB _id for refs
        testUser = await User.findOne({ email: "creator@example.com" });

        // Ensure user has organization role for campaign creation
        // Let's create an organization first to satisfy the required model validations
        testOrganization = await Organization.create({
            name: "Test Organization",
            description: "Test org description",
            adminUserId: testUser._id, // This is now a guaranteed valid ObjectId
            orgWalletAddress: "0x123",
            isVerified: true
        });
    });

    it("should get all campaigns", async () => {
        const response = await request(app).get("/api/campaigns");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return Unauthorized when creating a campaign without a token", async () => {
        const response = await request(app).post("/api/campaigns").send({
            title: "New Campaign",
            description: "Test description",
            totalGoalAmount: "1000",
            image: "test.jpg",
            orgId: testOrganization._id,
            creatorId: testUser._id,
        });
        expect(response.status).toBe(401);
    });
});
