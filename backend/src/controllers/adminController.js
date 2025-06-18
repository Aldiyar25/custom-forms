import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, role: true, createdAt: true, isBlocked: true }
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const blockUser = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await prisma.user.update({
      where: { id },
      data: { isBlocked: true }
    });
    res.json({ message: "User blocked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const unblockUser = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await prisma.user.update({
      where: { id },
      data: { isBlocked: false }
    });
    res.json({ message: "User unblocked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await prisma.user.delete({ where: { id } });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const grantAdmin = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await prisma.user.update({
      where: { id },
      data: { role: "ADMIN" }
    });
    res.json({ message: "Admin rights granted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const revokeAdmin = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await prisma.user.update({
      where: { id },
      data: { role: "USER" }
    });
    res.json({ message: "Admin rights revoked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
