import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getUserTemplates = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (req.user.id !== id && req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const templates = await prisma.template.findMany({
      where: { authorId: id },
      include: { author: true, tags: true, likes: true, allowedUsers: true },
    });
    res.json(templates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching templates" });
  }
};

export const getUserForms = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (req.user.id !== id && req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const forms = await prisma.form.findMany({
      where: { userId: id },
      include: { template: true, answers: true },
    });
    res.json(forms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching forms" });
  }
};

export const getApiToken = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (req.user.id !== id && req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    let user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.apiToken) {
      const { randomBytes } = await import("crypto");
      const token = randomBytes(32).toString("hex");
      user = await prisma.user.update({
        where: { id },
        data: { apiToken: token },
      });
    }
    res.json({ apiToken: user.apiToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating token" });
  }
};
