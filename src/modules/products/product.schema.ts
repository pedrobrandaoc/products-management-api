import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(150),

  price: z
    .number()
    .positive("O preço deve ser maior que zero.")
    .finite("O preço deve ser um número válido."),

  stock: z
    .number()
    .int()
    .min(0, "O estoque não pode ser negativo")
});

export const listProductsSchema = z.object({
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

export const listProductByIdSchema = z.object({
  id: z
    .string()
    .uuid("Id do produto inválido."),
})

export const editProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(150)
    .optional()
  ,

  price: z
    .number()
    .positive("O preço deve ser maior que zero.")
    .finite("O preço deve ser um número válido.")
    .optional(),

  stock: z
    .number()
    .int()
    .min(0, "O estoque não pode ser negativo")
    .optional(),

  isActive: z
    .boolean()
    .optional(),
})
  .refine( // evita que enviem informações vazias
    (data) => Object.keys(data).length > 0,
    {
      message: "Envie pelo menos um campo para atualização."
    }
);

export const deleteProductByIdSchema = z.object({
  id: z
    .string()
    .uuid("Id do produto inválido."),
})
