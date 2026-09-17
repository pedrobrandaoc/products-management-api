import { invoiceRepository } from "./invoice.repository.js";
import { productRepository } from "../products/product.repository.js";
import { InvoiceStatus } from "../../generated/prisma/client.js";
import { AppError } from "../../shared/errors/app-erros.js";

type CreateInvoiceInput = {
  number: number;
  customerName: string;
  status?: InvoiceStatus;
  createdById: string;
  items: {
    productId: string;
    quantity: number;
  }[];
};

type ListInvoices = {
  page: number;
  limit: number;
};

export async function createInvoiceService(data: CreateInvoiceInput) {
  // verifica se já existe uma fatura com esse número
  const existingInvoice = await invoiceRepository.findByNumber(data.number);

  if (existingInvoice) {
    throw new AppError("Já existe uma fatura cadastrada com este número.", 409);
  }

  let invoiceTotal = 0;
  const enrichedItems = [];

  // valida produtos, preços e calcula totais
  for (const item of data.items) {
    const product = await productRepository.findById(item.productId); // busca produto pelo id

    if (!product) {
      throw new AppError(
        `Produto com ID ${item.productId} não encontrado.`,
        404,
      );
    }

    if (!product.isActive) {
      throw new AppError(
        `O produto ${product.name} está inativo e não pode ser faturado.`,
        400,
      );
    }

    if (product.stock < item.quantity) {
      throw new AppError(
        `Estoque insuficiente para o produto ${product.name}.`,
        400,
      );
    }

    const unitPrice = Number(product.price);
    const itemTotal = unitPrice * item.quantity;

    // monta o item completo que o repository precisa para salvar
    enrichedItems.push({
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      unitPrice: unitPrice,
      total: itemTotal,
    });
  }

  const invoice = await invoiceRepository.create({
    number: data.number,
    customerName: data.customerName,
    ...(data.status !== undefined && { status: data.status }),
    total: invoiceTotal,
    createdById: data.createdById,
    items: enrichedItems,
  });

  // da baixa nos produtos adicionados à fatura
  for (const item of data.items) {
    await productRepository.decreaseStock(item.productId, item.quantity);
  }

  return invoice;
}

export async function listInvoicesService(data: ListInvoices) {
  const result = await invoiceRepository.findAll(data.page, data.limit);

  // Mapeia a lista de faturas para calcular o total de cada uma em tempo real
  const invoices = result.invoices.map((invoice) => {
    // Garante que a fatura tem a lista de itens antes de tentar somar
    if (!invoice.items) return invoice;

    const calculatedTotal = invoice.items.reduce((acc, item) => {
      return acc + Number(item.total);
    }, 0);

    return {
      ...invoice,
      total: calculatedTotal.toString(), // Atualiza o total zerado pelo calculado
    };
  });

  const totalPages = Math.ceil(result.total / data.limit); // arredonda pra cima

  return {
    invoices,
    pagination: {
      page: data.page,
      limit: data.limit,
      total: result.total,
      totalPages: totalPages,
    },
  };
}

export async function listInvoiceByIdService(id: string) {
  const invoice = await invoiceRepository.findById(id);

  if (!invoice) {
    throw new AppError("Id da fatura inválido ou inexistente.", 404);
  }

  const calculatedTotal = invoice.items.reduce((acc, item) => {
    return acc + Number(item.total);
  }, 0);

  return {
    ...invoice,
    total: calculatedTotal.toString() // Convertendo para string para manter o padrão da sua API
  };
}

export async function issueInvoiceByIdService(id: string, userId: string) {
  const invoice = await invoiceRepository.findById(id);

  if (!invoice) {
    throw new AppError("Fatura não encontrada.", 404);
  }

  if (invoice.status === InvoiceStatus.CANCELLED) {
    throw new AppError("Uma fatura cancelada não pode ser emitida.", 400);
  }

  return await invoiceRepository.issue(id, userId);
}

export async function cancelInvoiceByIdService(id: string, userId: string) {
  const invoice = await invoiceRepository.findById(id);

  if (!invoice) {
    throw new AppError("Fatura não encontrada.", 404);
  }

  if (invoice.status === InvoiceStatus.CANCELLED) {
    throw new AppError("Esta fatura já está cancelada.", 400);
  }

  const updatedInvoice = await invoiceRepository.cancel(id, userId);

  for (const item of invoice.items) {
    await productRepository.increaseStock(item.productId, item.quantity);
  };

  return updatedInvoice;
}
