import { prisma } from "../../config/prisma.js";
import { InvoiceStatus } from "../../generated/prisma/client.js";

export const invoiceRepository = {
  async create(data: {
    number: number;
    customerName: string;
    status?: InvoiceStatus;
    total: number;
    createdById: string;
    items: {
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }[];
  }) {
    return prisma.invoice.create({
      data: {
        number: data.number,
        customerName: data.customerName,
        status: data.status ?? "DRAFT",
        total: data.total,
        createdById: data.createdById,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: {
        items: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  },

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        skip,
        take: limit,
        include: {
          items: true,
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          updatedBy: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.invoice.count(),
    ]);

    return {
      invoices,
      total,
    };
  },

  async findById(id: string) {
    return prisma.invoice.findUnique({
      where: {
        id,
      },
      include: {
        items: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        updatedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  },

  async findByNumber(number: number) {
    return prisma.invoice.findUnique({
      where: {
        number,
      },
    });
  },

  async editById(
    id: string,
    data: {
      customerName?: string | undefined;
      status?: InvoiceStatus | undefined;
      total?: number | undefined;
      updatedById: string;
      items?:
        | {
            productId: string;
            productName: string;
            quantity: number;
            unitPrice: number;
            total: number;
          }[]
        | undefined;
    },
  ) {
    return prisma.invoice.update({
      where: {
        id,
      },
      data: {
        ...(data.customerName !== undefined && {
          customerName: data.customerName,
        }),

        ...(data.status !== undefined && {
          status: data.status,
        }),

        ...(data.total !== undefined && {
          total: data.total,
        }),

        updatedById: data.updatedById,

        // O Prisma lida com a deleção e criação dos itens automaticamente na mesma query
        ...(data.items && {
          items: {
            deleteMany: {}, // Remove os itens antigos
            create: data.items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
            })),
          },
        }),
      },
      include: {
        items: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        updatedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  },

  async deleteById(id: string) {
    // Como o schema possui onDelete: Restrict, precisamos excluir os itens primeiro
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: id },
    });

    return prisma.invoice.delete({
      where: {
        id,
      },
    });
  },

  async issue(id: string, updatedById: string) {
    return await prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.ISSUED,
        updatedById,
      },
    });
  },

  async cancel(id: string, updatedById: string) {
    return await prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.CANCELLED,
        updatedById,
      },
    });
  },
};
