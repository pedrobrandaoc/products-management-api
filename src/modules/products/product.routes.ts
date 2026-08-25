import { Router } from "express";

import { createProductController, listProductController, listProductByIdController, editProductById, deleteProductByIdController } from "./product.controller.js";
import { requireAuth } from "../../middlewares/require-auth.middleware.js";
import { csrfProtection } from "../../middlewares/csrf.middleware.js";

export const productRouter = Router();

// cria produto
productRouter.post('/', requireAuth, csrfProtection, createProductController);

// lista produtos
productRouter.get('/', requireAuth, listProductController);

// lista produto pelo id
productRouter.get('/:id', requireAuth, listProductByIdController);

// edita produto pelo id
productRouter.patch('/:id', requireAuth, editProductById);

// deleta produto pelo id
productRouter.delete('/:id', requireAuth, csrfProtection, deleteProductByIdController);
