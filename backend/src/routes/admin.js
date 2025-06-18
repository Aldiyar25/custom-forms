import { Router } from "express";
import { verifyToken, isAdmin } from "../middlewares/auth.js";
import {
  listUsers,
  blockUser,
  unblockUser,
  deleteUser,
  grantAdmin,
  revokeAdmin,
} from "../controllers/adminController.js";

const router = Router();
router.use(verifyToken, isAdmin);

router.get("/users", listUsers);
router.patch("/users/:id/block", blockUser);
router.patch("/users/:id/unblock", unblockUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/grant", grantAdmin);
router.patch("/users/:id/revoke", revokeAdmin);

export default router;
