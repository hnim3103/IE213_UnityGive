import express from "express"
import {  getAllOrganizations, 
          createOrganization, 
          updateOrganization,
          deleteOrganization,    
} from "../controllers/organizationControllers.js";

const router = express.Router();

router.get("/", getAllOrganizations);

router.post("/", createOrganization);

router.put("/:id", updateOrganization);

router.put("/:id", deleteOrganization);

export default router;