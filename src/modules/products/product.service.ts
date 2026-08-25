import { productRepository } from "./product.repository.js";

import { AppError } from "../../shared/errors/app-erros.js";

type CreateProduct = {
  name: string;
  price: number;
  stock: number;
  createdById: string;
};

type ListProduct = {
  page: number;
  limit: number;
};

type EditProduct = {
  name?: string | undefined;
  price?: number | undefined;
  stock?: number | undefined;
  isActive?: boolean | undefined;
  updatedById: string;
};

export async function createProductService(data: CreateProduct) {
  return await productRepository.create(data);
}

export async function listProductService(data: ListProduct) {
  const result = await productRepository.findAll(data.page, data.limit);

  const products = result.products;

  const totalPages = Math.ceil(result.total / data.limit); // total de produtos / limit por página -> arredonda pra cima

  return {
    products,
    pagination: {
      page: data.page,
      limit: data.limit,
      total: result.total,
      totalPages: totalPages,
    },
  };
}

export async function listProductByIdService(id: string) {
  const product = productRepository.findById(id);

  if (!product) {
    throw new AppError("Produto não encontrado.", 404);
  }

  return product;
}

export async function editProductByIdService(id: string, data: EditProduct) {
  const product = await productRepository.findById(id);

  if (!product) {
    throw new AppError("Produto não encontrado.", 404);
  }

  return productRepository.editById(id, data);
};

export async function deleteProductByIdService(id: string) {
  const product = await productRepository.findById(id);

  if (!product) {
    throw new AppError("Produto não encontrado.", 404);
  };

  return productRepository.deleteById(id);

}
