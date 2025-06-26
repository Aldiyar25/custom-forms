import { Router } from "express";
import {
  createForm,
  getForms,
  updateForm,
  deleteAnswer,
  getFormById,
} from "../controllers/formController.js";
import { verifyToken, optionalAuth } from "../middlewares/auth.js";

const router = Router();

router.post("/", verifyToken, createForm);
router.get("/", verifyToken, getForms);
router.put("/:id", verifyToken, updateForm);
router.delete("/:formId/answers/:answerId", verifyToken, deleteAnswer);
router.get("/:id", optionalAuth, getFormById);

export default router;
