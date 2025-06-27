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
    const { allowedUserIds, tags, questions, ...rest } = req.body;
    const updated = await prisma.template.update({
      where: { id },
      data: {
        ...rest,
        tags: Array.isArray(tags)
          ? {
              deleteMany: {},
              connectOrCreate: tags.map((name) => ({
                where: { name },
                create: { name },
              })),
            }
          : undefined,
        questions: Array.isArray(questions)
          ? {
              deleteMany: {},
              create: questions.map((q) => ({
                text: q.text,
                type: q.type,
                order: q.order,
                options:
                  q.type === "CHECKBOX"
                    ? { create: q.options.map((o) => ({ text: o })) }
                    : undefined,
              })),
            }
          : undefined,
        allowedUsers: Array.isArray(allowedUserIds)
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

export const getTemplateAnalytics = async (req, res) => {
  const id = +req.params.id;
  try {
    const template = await prisma.template.findUnique({
      where: { id },
      include: { questions: { include: { options: true } }, author: true },
    });
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    if (
      !req.user ||
      (template.authorId !== req.user.id && req.user.role !== "ADMIN")
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const analytics = [];

    for (const q of template.questions) {
      const answers = await prisma.answer.findMany({
        where: { questionId: q.id },
        select: { answerText: true },
      });

      if (q.type === "NUMBER") {
        const numbers = answers
          .map((a) => parseFloat(a.answerText))
          .filter((n) => !isNaN(n));
        const count = numbers.length;
        const sum = numbers.reduce((acc, n) => acc + n, 0);
        const avg = count ? sum / count : null;
        const min = count ? Math.min(...numbers) : null;
        const max = count ? Math.max(...numbers) : null;
        analytics.push({
          questionId: q.id,
          question: q.text,
          type: q.type,
          count,
          average: avg,
          min,
          max,
        });
      } else if (q.type === "CHECKBOX") {
        const counts = {};
        answers.forEach((a) => {
          try {
            const values = JSON.parse(a.answerText);
            if (Array.isArray(values)) {
              values.forEach((v) => {
                counts[v] = (counts[v] || 0) + 1;
              });
            } else if (a.answerText) {
              counts[a.answerText] = (counts[a.answerText] || 0) + 1;
            }
          } catch {
            if (a.answerText) {
              const vals = a.answerText.split(",");
              vals.forEach((v) => {
                const val = v.trim();
                if (val) counts[val] = (counts[val] || 0) + 1;
              });
            }
          }
        });
        analytics.push({
          questionId: q.id,
          question: q.text,
          type: q.type,
          counts,
        });
      } else {
        analytics.push({
          questionId: q.id,
          question: q.text,
          type: q.type,
          answers: answers.map((a) => a.answerText),
        });
      }
    }

    res.json({ templateId: template.id, analytics });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating analytics" });
  }
};

export const getTemplateResponses = async (req, res) => {
  const id = +req.params.id;
  try {
    const template = await prisma.template.findUnique({ where: { id } });
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    if (
      !req.user ||
      (template.authorId !== req.user.id && req.user.role !== "ADMIN")
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const forms = await prisma.form.findMany({
      where: { templateId: id },
      orderBy: { submittedAt: "desc" },
      include: {
        user: true,
        answers: {
          include: {
            question: { select: { text: true } },
          },
        },
      },
    });

    res.json({ templateId: template.id, forms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching responses" });
  }
};
