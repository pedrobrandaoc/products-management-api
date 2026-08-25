import { prisma } from "../../config/prisma.js";

export const userRepository = {

  // procura um usuário pelo email
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  },

  // procura usuario pelo id
  async findById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      }
    });
  },

  // recebe as informações, cria o usuário, retorna as informações sem a senha
  async create(data: {
    name: string;
    email: string,
    passwordHash: string,
  }) {
    return prisma.user.create({
      data,
      select: { // define o que é mostrado
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },
};
