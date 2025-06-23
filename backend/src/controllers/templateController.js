import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createTemplate = async (req, res) => {
  const {
    title,
    description,
    content,
    isPublic,
    tags,
    questions,
    imageUrl,
    theme,
    allowedUserIds = [],
  } = req.body;
  try {
    const tpl = await prisma.template.create({
      data: {
        title,
        description,
        content,
        theme,
        isPublic,
        imageUrl,
        author: { connect: { id: req.user.id } },
        tags: {
          connectOrCreate: tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
        questions: {
          create: questions.map((q) => ({
            text: q.text,
            type: q.type,
            order: q.order,
            options:
              q.type === "CHECKBOX"
                ? { create: q.options.map((opt) => ({ text: opt })) }
                : undefined,
          })),
        },
        allowedUsers: {
          create: allowedUserIds.map((uid) => ({
            user: { connect: { id: uid } },
          })),
        },
      },
      include: { tags: true, questions: true, allowedUsers: true },
    });
    res.status(201).json(tpl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating template" });
  }
};

export const getAllTemplates = async (req, res) => {
  const { search } = req.query;
  const where = search
    ? { title: { contains: search, mode: "insensitive" } }
    : {};
  const templates = await prisma.template.findMany({
    where,
    include: { author: true, tags: true, likes: true, allowedUsers: true },
  });
  res.json(templates);
};

export const searchTemplates = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: "Missing query" });

  try {
    const ids = await prisma.$queryRaw`
      SELECT DISTINCT t.id FROM "Template" t
      WHERE
        to_tsvector('english', t.title || ' ' || t.description) @@ plainto_tsquery('english', ${q})
        OR EXISTS (
          SELECT 1 FROM "Question" q
          WHERE q."templateId" = t.id
            AND to_tsvector('english', q.text) @@ plainto_tsquery('english', ${q})
        )
        OR EXISTS (
          SELECT 1 FROM "Comment" c
          WHERE c."templateId" = t.id
            AND to_tsvector('english', c.text) @@ plainto_tsquery('english', ${q})
        );
    `;

    const templates = await prisma.template.findMany({
      where: { id: { in: ids.map((r) => r.id) } },
      include: { author: true, tags: true, likes: true, allowedUsers: true },
    });

    res.json(templates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTemplateById = async (req, res) => {
  const id = +req.params.id;
  const tpl = await prisma.template.findUnique({
    where: { id },
    include: {
      author: true,
      tags: true,
      questions: { include: { options: true } },
      comments: { include: { author: true } },
      likes: true,
      allowedUsers: { include: { user: true } },
    },
  });
  if (!tpl) return res.status(404).json({ message: "Template not found" });
  res.json(tpl);
};

export const updateTemplate = async (req, res) => {
  const id = +req.params.id;
  try {
    const { allowedUserIds, ...data } = req.body;
    const updated = await prisma.template.update({
      where: { id },
      data: {
        ...data,
        allowedUsers: allowedUserIds
          ? {
              deleteMany: {},
              create: allowedUserIds.map((uid) => ({
                user: { connect: { id: uid } },
              })),
            }
          : undefined,
      },
      include: { tags: true, questions: true, allowedUsers: true },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteTemplate = async (req, res) => {
  const id = +req.params.id;
  try {
    await prisma.$transaction([
      prisma.comment.deleteMany({ where: { templateId: id } }),
      prisma.like.deleteMany({ where: { templateId: id } }),
      prisma.templateAccess.deleteMany({ where: { templateId: id } }),
      prisma.answer.deleteMany({ where: { form: { templateId: id } } }),
      prisma.form.deleteMany({ where: { templateId: id } }),
      prisma.option.deleteMany({ where: { question: { templateId: id } } }),
      prisma.question.deleteMany({ where: { templateId: id } }),
      prisma.template.delete({ where: { id } }),
    ]);
    res.json({ message: "Template deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting template" });
  }
};
