import { Router } from "express";
import { getAggregatedResults } from "../controllers/externalController.js";

const router = Router();

router.get("/analytics", getAggregatedResults);

export default router;
