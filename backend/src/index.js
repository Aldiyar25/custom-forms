import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/auth.js";
import { verifyToken } from "./middlewares/auth.js";
import templateRoutes from "./routes/templates.js";
import tagRoutes from "./routes/tags.js";
import uploadRoutes from "./routes/uploads.js";
import { isAdmin } from "./middlewares/auth.js";
import adminRoutes from "./routes/admin.js";
import formRoutes from "./routes/forms.js";
import userRoutes from "./routes/users.js";
import externalRoutes from "./routes/external.js";

dotenv.config();

const app = express();
app.set("trust proxy", true);
const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://custom-forms-ui.onrender.com";

app.use(
  cors({
    origin: FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(
  "/uploads",
  cors({ origin: FRONTEND_URL || "http://localhost:5173" }),
  express.static(path.join(process.cwd(), "src", "uploads"), {
    setHeaders: (res) => {
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);
app.use("/api/uploads", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/users", userRoutes);
app.use("/api/external", externalRoutes);

app.get("/api/protected", verifyToken, (req, res) => {
  res.json({
    message: "Hi, user " + req.user.id + " with role " + req.user.role,
  });
});

app.delete("/api/admin/some-resource", verifyToken, isAdmin, (req, res) => {
  res.json({ message: "Resource deleted by admin" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
