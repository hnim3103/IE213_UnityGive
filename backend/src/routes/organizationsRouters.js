import express from "express"
import { getAllOrganizations, createOrganization, updateOrganization, deleteOrganization } from "../controllers/organizationControllers.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Organizations
 *   description: Organization management
 */

/**
 * @swagger
 * /api/organizations:
 *   get:
 *     summary: Get all organizations
 *     tags: [Organizations]
 *     responses:
 *       200:
 *         description: List of organizations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Organization'
 */
router.get("/", getAllOrganizations);

/**
 * @swagger
 * /api/organizations:
 *   post:
 *     summary: Create an organization
 *     tags: [Organizations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Organization'
 *     responses:
 *       201:
 *         description: Organization created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 */
router.post("/", createOrganization);

/**
 * @swagger
 * /api/organizations/{id}:
 *   put:
 *     summary: Update an organization
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Organization'
 *     responses:
 *       200:
 *         description: Organization updated
 */
router.put("/:id", updateOrganization);

/**
 * @swagger
 * /api/organizations/{id}:
 *   delete:
 *     summary: Delete an organization
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organization deleted
 */
router.delete("/:id", deleteOrganization);

export default router;