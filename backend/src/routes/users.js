import { Router } from "express";
import { verifyToken } from "../middlewares/auth.js";
import { getUserTemplates, getUserForms } from "../controllers/userController.js";

const router = Router();

router.get('/:id/templates', verifyToken, getUserTemplates);
router.get('/:id/forms', verifyToken, getUserForms);

export default router;
