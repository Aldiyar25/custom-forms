import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createForm = async (req, res) => {
  const { templateId, answers } = req.body;
  try {
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: { allowedUsers: true },
    });
    if (!template)
      return res.status(404).json({ message: "Template not found" });
    if (!template.isPublic) {
      const allowed = template.allowedUsers.some(
        (au) => au.userId === req.user.id
      );
      if (!allowed && req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Access denied" });
      }
    }
    const form = await prisma.form.create({
      data: {
        template: { connect: { id: templateId } },
        user: { connect: { id: req.user.id } },
        answers: {
          create: answers.map((a) => ({
            question: { connect: { id: a.questionId } },
            answerText: a.answerText,
          })),
        },
      },
      include: { answers: true },
    });
    res.status(201).json(form);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating form" });
  }
};

export const getForms = async (req, res) => {
  const { userId, templateId } = req.query;
  const where = {};
  if (userId) where.userId = +userId;
  if (templateId) where.templateId = +templateId;

  if (
    !req.user ||
    (userId && +userId !== req.user.id && req.user.role !== "ADMIN")
  ) {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const forms = await prisma.form.findMany({
      where,
      include: { answers: true },
    });
    res.json(forms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching forms" });
  }
};

export const updateForm = async (req, res) => {
  const id = +req.params.id;
  const { answers } = req.body;
  try {
    const form = await prisma.form.findUnique({ where: { id } });
    if (!form) return res.status(404).json({ message: "Form not found" });
    if (form.userId !== req.user.id && req.user.role !== "ADMIN")
      return res.status(403).json({ message: "Access denied" });

    const updated = await prisma.form.update({
      where: { id },
      data: {
        answers: {
          deleteMany: {},
          create: answers.map((a) => ({
            questionId: a.questionId,
            answerText: a.answerText,
          })),
        },
      },
      include: { answers: true },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating form" });
  }
};

export const deleteAnswer = async (req, res) => {
  const formId = +req.params.formId;
  const answerId = +req.params.answerId;
  try {
    const form = await prisma.form.findUnique({ where: { id: formId } });
    if (!form) return res.status(404).json({ message: "Form not found" });
    if (form.userId !== req.user.id && req.user.role !== "ADMIN")
      return res.status(403).json({ message: "Access denied" });

    await prisma.answer.delete({ where: { id: answerId } });
    res.json({ message: "Answer deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting answer" });
  }
};

export const getFormById = async (req, res) => {
  const id = +req.params.id;
  try {
    const form = await prisma.form.findUnique({
      where: { id },
      include: {
        user: true,
        template: { include: { author: true } },
        answers: { include: { question: { select: { text: true } } } },
      },
    });
    if (!form) return res.status(404).json({ message: "Form not found" });

    const tpl = form.template;
    const isOwner = req.user && req.user.id === form.userId;
    const isTplAuthor = req.user && req.user.id === tpl.authorId;
    const isAdmin = req.user && req.user.role === "ADMIN";

    if (!tpl.isPublic && !(isOwner || isTplAuthor || isAdmin)) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(form);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching form" });
  }
};
