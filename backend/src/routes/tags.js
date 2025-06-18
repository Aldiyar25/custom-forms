import { Router } from "express";
import { getTags } from "../controllers/tagController.js";
const router = Router();
router.get("/", getTags);
export default router;
