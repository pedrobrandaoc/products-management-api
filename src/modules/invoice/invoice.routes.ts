import { Router } from "express";

import { requireAuth } from "../../middlewares/require-auth.middleware.js";

import {
  createInvoiceController,
  listInvoicesController,
  listInvoiceByIdController,
  issueInvoiceController,
  cancelInvoiceController
} from "./invoice.controller.js";

export const invoiceRouter = Router();

invoiceRouter.post('/', requireAuth, createInvoiceController);
invoiceRouter.get("/", requireAuth, listInvoicesController);
invoiceRouter.get("/:id", requireAuth, listInvoiceByIdController);
invoiceRouter.patch('/:id/issue', requireAuth, issueInvoiceController);
invoiceRouter.patch('/:id/cancel', requireAuth, cancelInvoiceController);
