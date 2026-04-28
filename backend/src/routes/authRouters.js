import express from "express";
import { signupService, loginService, getWeb3Nonce, web3Login, forgotPasswordService, resetPasswordService } from "../services/authService.js";
import { signupSchema } from "../validators/signupValidator.js";
import { loginSchema } from "../validators/loginValidator.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Secret123!
 *               role:
 *                 type: string
 *                 enum: [donor, organization]
 *                 default: donor
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
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

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Secret123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
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
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset email
 *     tags: [Auth]
 */
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });
        
        const result = await forgotPasswordService(email);
        res.status(200).json(result);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "An internal server error occurred" });
    }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Set a new password matching the valid token
 *     tags: [Auth]
 */
router.post("/reset-password", async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) return res.status(400).json({ message: "Token and newPassword are required" });
        
        const result = await resetPasswordService(token, newPassword);
        res.status(200).json(result);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.error("Reset password error:", error);
        res.status(500).json({ message: "An internal server error occurred" });
    }
});

/**
 * Web3 Authentication Routes
 */

/**
 * @swagger
 * /api/auth/web3/nonce:
 *   post:
 *     summary: Request a nonce for Web3 wallet authentication
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 example: "0x1234567890abcdef1234567890abcdef12345678"
 *     responses:
 *       200:
 *         description: Nonce generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nonce:
 *                   type: string
 *       400:
 *         description: Wallet address required
 *       500:
 *         description: Internal server error
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

/**
 * @swagger
 * /api/auth/web3/login:
 *   post:
 *     summary: Authenticate using a Web3 wallet signature
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *               - signature
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 example: "0x1234567890abcdef1234567890abcdef12345678"
 *               signature:
 *                 type: string
 *                 example: "0xabcdef1234567890..."
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Wallet address and signature required
 *       401:
 *         description: Invalid signature
 *       500:
 *         description: Internal server error
 */
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