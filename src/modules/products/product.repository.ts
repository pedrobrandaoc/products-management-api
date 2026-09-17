import { prisma } from "../../config/prisma.js";

export const productRepository = {
  async create(data: {
    name: string;
    price: number;
    stock: number;
    createdById: string;
  }) {
    return prisma.product.create({
      data,
    });
  },

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
        },

        skip,
        take: limit,

        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.product.count({
        where: {
          isActive: true,
        },
      }),
    ]);

    return {
      products,
      total,
    };
  },

  async findById(id: string) {
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    return product;
  },

  async editById(
    id: string,
    data: {
      name?: string | undefined;
      price?: number | undefined;
      stock?: number | undefined;
      isActive?: boolean | undefined;
      updatedById: string;
    },
  ) {
    return prisma.product.update({
      where: {
        id,
      },

      data: {
        ...(data.name !== undefined && {
          name: data.name,
        }),

        ...(data.price !== undefined && {
          price: data.price,
        }),

        ...(data.stock !== undefined && {
          stock: data.stock,
        }),

        ...(data.isActive !== undefined && {
          isActive: data.isActive,
        }),

        updatedById: data.updatedById,
      },
    });
  },

  async deactivateById(id: string) {
    // inativacao logica atualizando o status
    return prisma.product.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });
  },

  async increaseStock(id: string, quantity: number) {
    return prisma.product.update({
      where: {
        id,
      },
      data: {
        stock: {
          increment: quantity,
        },
      },
    });
  },

  async decreaseStock(id: string, quantity: number) {
    return prisma.product.update({
      where: {
        id,
      },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });
  },

  async getStockById(id: string) {
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      select: {
        stock: true,
      },
    });

    return product;
  },
};
