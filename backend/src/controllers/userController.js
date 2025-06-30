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
