import request from "supertest";
import app from "../src/server.js";
import User from "../src/models/User.js";

describe("User API Endpoints", () => {
    let token;
    let testUser;

    beforeEach(async () => {
        // Create a new user for each test block
        testUser = await User.create({
            name: "Profile User",
            email: "profile@example.com",
            passwordHash: "hashedpassword123",
            role: "donor",
        });

        // Provide a valid JWT token by hitting login
        // We recreate the user purely for DB and bypass auth, or we can use the API
        await User.deleteMany(); // cleanup

        // Let's use the API to get a real token
        await request(app).post("/api/auth/signup").send({
            name: "Profile User",
            email: "profile@example.com",
            password: "Password123",
        });

        const res = await request(app).post("/api/auth/login").send({
            email: "profile@example.com",
            password: "Password123",
        });
        token = res.body.token;
    });

    it("should retrieve the current user's profile with a valid token", async () => {
        const response = await request(app)
            .get("/api/users/profile")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.email).toBe("profile@example.com");
    });

    it("should return Unauthorized without a token", async () => {
        const response = await request(app).get("/api/users/profile");
        expect(response.status).toBe(401);
    });
});
