import { Router } from "express";
import { verifyToken } from "../middlewares/auth.js";
import {
  getUserTemplates,
  getUserForms,
  getApiToken,
} from "../controllers/userController.js";
import { pushToSalesforce } from "../controllers/salesforceController.js";

const router = Router();

router.get("/:id/templates", verifyToken, getUserTemplates);
router.get("/:id/forms", verifyToken, getUserForms);
router.post("/:id/salesforce", verifyToken, pushToSalesforce);
router.get("/:id/api-token", verifyToken, getApiToken);

export default router;
