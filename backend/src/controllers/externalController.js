import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAggregatedResults = async (req, res) => {
  const token = req.query.token || req.headers["x-api-token"];
  if (!token) return res.status(401).json({ message: "Token required" });
  try {
    const user = await prisma.user.findUnique({ where: { apiToken: token } });
    if (!user) return res.status(401).json({ message: "Invalid token" });

    const templates = await prisma.template.findMany({
      where: { authorId: user.id },
      include: { questions: { include: { options: true } } },
    });

    const result = [];
    for (const tpl of templates) {
      const analytics = [];
      for (const q of tpl.questions) {
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
      result.push({
        templateId: tpl.id,
        templateTitle: tpl.title,
        analytics,
      });
    }

    res.json({ templates: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating analytics" });
  }
};
