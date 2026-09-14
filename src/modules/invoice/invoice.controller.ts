import type { Request, Response } from "express";
import { InvoiceStatus } from "../../generated/prisma/client.js";

import {
  createInvoiceSchema,
  listInvoicesSchema,
  listInvoiceByIdSchema,
  issueInvoiceByIdSchema,
  cancelInvoiceByIdSchema
} from "./invoice.schema.js";

import {
  createInvoiceService,
  listInvoiceByIdService,
  listInvoicesService,
  issueInvoiceByIdService,
  cancelInvoiceByIdService
} from "./invoice.service.js";

export async function createInvoiceController(req: Request, res: Response) {
  const userId = req.session.userId as string;

  const data = createInvoiceSchema.parse(req.body);
  const { status, ...restData } = data; // separamos o status do resto dos dados

  const invoiceData = {
    ...restData,
    createdById: userId,
    ...(status !== undefined && { status: status as InvoiceStatus }) // valida se tem status
  };

  const invoice = await createInvoiceService(invoiceData);

  res.status(201).json(invoice);

};

export async function listInvoicesController(req: Request, res: Response) {
  const data = listInvoicesSchema.parse(req.query);

  const invoices = await listInvoicesService(data);

   res.status(200).json(invoices);
}

export async function listInvoiceByIdController(req: Request, res: Response) {
  const { id } = listInvoiceByIdSchema.parse(req.params);

  const invoice = await listInvoiceByIdService(id);

  res.status(200).json(invoice);
}

export async function issueInvoiceController(req: Request, res: Response) {
  const { id } = listInvoiceByIdSchema.parse(req.params);
  const userId = (req as any).session.userId;

  const invoice = await issueInvoiceByIdService(id, userId);

  res.status(200).json(invoice);
};

export async function cancelInvoiceController(req: Request, res: Response) {
  const { id } = listInvoiceByIdSchema.parse(req.params);
  const userId = (req as any).session.userId;

  const invoice = await cancelInvoiceByIdService(id, userId);

  res.status(200).json(invoice);
};
