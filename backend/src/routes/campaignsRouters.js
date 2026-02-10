import express from "express"
import {  getAllCampaigns, 
          getCampaignByID,
          createCampaign, 
          updateCampaign,
          deleteCampaign,    
} from "../controllers/campaignsControllers.js";

const router = express.Router();

router.get("/", getAllCampaigns);

router.get("/:id", getCampaignByID);

router.post("/", createCampaign);

router.put("/:id", updateCampaign);

router.put("/:id", deleteCampaign);

export default router;