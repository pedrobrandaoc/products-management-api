import type { Request, Response } from "express";

import {
  createProductService,
  listProductService,
  listProductByIdService,
  editProductByIdService,
  deleteProductByIdService
} from "./product.service.js";

import {
  createProductSchema,
  listProductsSchema,
  listProductByIdSchema,
  editProductSchema,
  deleteProductByIdSchema
} from "./product.schema.js";

import { AppError } from "../../shared/errors/app-erros.js";

export async function createProductController(req: Request, res: Response) {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({
      message: "Não autenticado.",
    });
  }

  const productDataValidated = createProductSchema.parse(req.body);

  const product = await createProductService({
    ...productDataValidated,
    createdById: userId,
  });

  return res.status(201).json({
    message: "Produto criado com sucesso.",
    product,
  });
};

export async function listProductController(req: Request, res: Response) {
  const data = listProductsSchema.parse(req.query);

  const products = await listProductService(data);

  return res.status(200).json(products);
}

export async function listProductByIdController(req: Request, res: Response) {
  const { id } = listProductByIdSchema.parse(req.params);

  const product = await listProductByIdService(id);

  return res.status(200).json({
    product,
  });
};

export async function editProductById(req: Request, res: Response) {
  const userId = req.session.userId;

  if (!userId) {
    throw new AppError("Não autenticado.", 401);
  }

  const { id } = listProductByIdSchema.parse(req.params);

  const data = editProductSchema.parse(req.body);

  const product = await editProductByIdService(id, {
    ...data,
    updatedById: userId,
  });

  return res.status(200).json({
    message: "Produto editado com sucesso.",
    product,
  });
};

export async function deleteProductByIdController(req: Request, res: Response) {
  const { id } = deleteProductByIdSchema.parse(req.params);

  const product = await deleteProductByIdService(id);

  return res.status(200).json({
    message: 'Produto excluído com sucesso.',
    product
  });

};
