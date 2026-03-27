import express from "express";
import { signupService, loginService, getWeb3Nonce, web3Login } from "../services/authService.js";
import { signupSchema } from "../validators/signupValidator.js";
import { loginSchema } from "../validators/loginValidator.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management
 */

router.post("/signup", async (req, res) => {
    try {
        const validationResult = signupSchema.safeParse(req.body);

        if (!validationResult.success) {
            const formattedErrors = validationResult.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            return res.status(400).json({ errors: formattedErrors });
        }

        const user = await signupService(validationResult.data);

        res.status(201).json({
            message: "User created successfully",
            user
        });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        console.error("Signup error:", error);
        res.status(500).json({ message: "An internal server error occurred" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const validationResult = loginSchema.safeParse(req.body);

        if (!validationResult.success) {
            const formattedErrors = validationResult.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            return res.status(400).json({ errors: formattedErrors });
        }

        const result = await loginService(validationResult.data);

        res.status(200).json({
            message: "Login successful",
            ...result
        });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        console.error("Login error:", error);
        res.status(500).json({ message: "An internal server error occurred" });
    }
});

/**
 * Web3 Authentication Routes
 */

router.post("/web3/nonce", async (req, res) => {
    try {
        const { walletAddress } = req.body;
        if (!walletAddress) {
            return res.status(400).json({ message: "walletAddress is required" });
        }

        const result = await getWeb3Nonce(walletAddress);
        res.status(200).json(result);
        
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        console.error("Nonce error:", error);
        res.status(500).json({ message: "An internal server error occurred" });
    }
});

router.post("/web3/login", async (req, res) => {
    try {
        const { walletAddress, signature } = req.body;
        if (!walletAddress || !signature) {
            return res.status(400).json({ message: "walletAddress and signature are required" });
        }

        const result = await web3Login(walletAddress, signature);
        
        res.status(200).json({
            message: "Login successful",
            ...result
        });
        
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        console.error("Web3 Login error:", error);
        res.status(500).json({ message: "An internal server error occurred" });
    }
});

export default router;