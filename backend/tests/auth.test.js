import request from "supertest";
import app from "../src/server.js";
import User from "../src/models/User.js";

describe("Auth API Endpoints", () => {
    const testUser = {
        name: "Test User",
        email: "testuser@example.com",
        password: "Password123",
    };

    it("should successfully sign up a new user", async () => {
        const response = await request(app).post("/api/auth/signup").send(testUser);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("User created successfully");

        const dbUser = await User.findOne({ email: testUser.email });
        expect(dbUser).toBeTruthy();
        expect(dbUser.name).toBe(testUser.name);
    });

    it("should fail to sign up with an existing email", async () => {
        // First signup
        await request(app).post("/api/auth/signup").send(testUser);

        // Second signup with same email
        const response = await request(app).post("/api/auth/signup").send({
            name: "Different User",
            email: testUser.email,
            password: "Password456",
        });

        expect(response.status).toBe(409);
        expect(response.body.message).toBe("Email already in use");
    });

    it("should successfully log in an existing user", async () => {
        await request(app).post("/api/auth/signup").send(testUser);

        const response = await request(app).post("/api/auth/login").send({
            email: testUser.email,
            password: testUser.password,
        });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Login successful");
        expect(response.body).toHaveProperty("token");
        expect(response.body.user.email).toBe(testUser.email);
    });

    it("should fail to log in with incorrect password", async () => {
        await request(app).post("/api/auth/signup").send(testUser);

        const response = await request(app).post("/api/auth/login").send({
            email: testUser.email,
            password: "WrongPassword123",
        });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid email or password");
    });

    it("should fail to log in if user does not exist", async () => {
        const response = await request(app).post("/api/auth/login").send({
            email: "nonexistent@example.com",
            password: "Password123",
        });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid email or password");
    });
});
