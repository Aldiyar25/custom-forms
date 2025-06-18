import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token not provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin privileges required" });
  }
  next();
};

export const isOwnerOrAdmin = (modelName) => {
  return async (req, res, next) => {
    const id = parseInt(req.params.id, 10);
    const record = await prisma[modelName].findUnique({
      where: { id },
      select: { authorId: true },
    });
    if (!record) {
      return res.status(404).json({ message: `${modelName} not found` });
    }
    if (record.authorId === req.user.id || req.user.role === "ADMIN") {
      return next();
    }
    return res.status(403).json({ message: "Access denied" });
  };
};
