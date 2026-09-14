import { z } from 'zod'

export const invoiceItemSchema = z.object({
  productId: z
    .string()
    .uuid(),
  quantity: z
    .number()
    .int()
    .positive(),
});

export const createInvoiceSchema = z.object({
  number: z
    .number()
    .int()
    .positive(),
  customerName: z
    .string()
    .min(1, 'O nome do cliente é obrigatório.'),
  status: z
    .enum(['DRAFT', 'ISSUED', 'CANCELED'])
    .optional(),
  items: z
    .array(invoiceItemSchema)
    .min(1, 'Fatura deve conter pelo menos um item.')
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

export const listInvoicesSchema = z.object({
    page: z.coerce // chega como string na url -> zod converte para number
        .number()
        .int()
        .positive()
        .default(1),

    limit: z.coerce
        .number()
        .int()
        .positive()
        .max(100)
        .default(10),
});

export const listInvoiceByIdSchema = z.object({
  id: z
    .string()
    .uuid("Id da fatura inválido."),
});

export const issueInvoiceByIdSchema = z.object({
  id: z
    .string()
    .uuid("Id da fatura inválido."),

});

export const cancelInvoiceByIdSchema = z.object({
  id: z
    .string()
    .uuid("Id da fatura inválido."),
});
