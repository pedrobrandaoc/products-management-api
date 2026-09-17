import { Router } from "express";

import { createProductController, listProductController, listProductByIdController, editProductById, deactivateProductByIdController } from "./product.controller.js";
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
productRouter.patch('/:id', requireAuth, csrfProtection, editProductById);

// desativa produto pelo id
productRouter.patch('/deactivate/:id', requireAuth, csrfProtection, deactivateProductByIdController);
