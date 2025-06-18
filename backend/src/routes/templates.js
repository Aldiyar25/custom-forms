import { Router } from "express";
import {
  createTemplate,
  getAllTemplates,
  getTemplateById,
  searchTemplates,
  updateTemplate,
  deleteTemplate,
} from "../controllers/templateController.js";

import {
  addComment,
  getComments,
  toggleLike,
} from "../controllers/commentController.js";
import { verifyToken, isOwnerOrAdmin } from "../middlewares/auth.js";

const router = Router();

router.get("/", getAllTemplates);
router.get("/search", searchTemplates);
router.get("/:id", getTemplateById);
router.post("/", verifyToken, createTemplate);
router.put("/:id", verifyToken, isOwnerOrAdmin("template"), updateTemplate);
router.delete("/:id", verifyToken, isOwnerOrAdmin("template"), deleteTemplate);

router.get("/:id/comments", getComments);
router.post("/:id/comments", verifyToken, addComment);
router.post("/:id/like", verifyToken, toggleLike);

export default router;
