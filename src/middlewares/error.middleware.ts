import type { NextFunction, Request, Response } from "express";

import { ZodError } from "zod";
import { AppError } from "../shared/errors/app-erros.js";

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // se 'err' for uma instancia de AppError, lance esse json com o statuscode definido e a message dele
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: err.issues,
    });
  }

  // se 'err' for uma instancia de AppError, lance esse json com o statuscode e message dele
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });

    console.error(err);

    return res.status(500).json({
      message: "Erro interno do servidor.",
    });
  }
}
