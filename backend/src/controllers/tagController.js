import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getTags = async (req, res) => {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  });
  res.json(tags.map((t) => t.name));
};
