import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const addComment = async (req, res) => {
  const templateId = +req.params.id;
  const { text } = req.body;
  try {
    const comment = await prisma.comment.create({
      data: {
        text,
        template: { connect: { id: templateId } },
        author: { connect: { id: req.user.id } },
      },
      include: { author: { select: { id: true, username: true } } },
    });

    res.status(201).json(comment);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error adding comment" });
  }
};

export const getComments = async (req, res) => {
  const templateId = +req.params.id;
  const { page = 1, perPage = 20 } = req.query;
  const skip = (page - 1) * perPage;
  try {
    const comments = await prisma.comment.findMany({
      where: { templateId },
      include: { author: { select: { id: true, username: true } } },
      orderBy: { createdAt: "asc" },
      skip,
      take: +perPage,
    });
    res.json(comments);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error fetching comments" });
  }
};

export const toggleLike = async (req, res) => {
  const templateId = +req.params.id;
  const userId = req.user.id;
  try {
    const existing = await prisma.like.findUnique({
      where: { userId_templateId: { userId, templateId } },
    });
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return res.json({ liked: false });
    } else {
      await prisma.like.create({
        data: {
          template: { connect: { id: templateId } },
          user: { connect: { id: userId } },
        },
      });
      return res.json({ liked: true });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error toggling like" });
  }
};
